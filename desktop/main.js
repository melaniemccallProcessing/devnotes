// desktop/src/main.js

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "./firebase";

// --- Auth state ---
let currentUser = null;
let authReady = false;
let authMode = "login"; // "login" | "register"
let authError = null;
let authLoading = false;

// --- Dummy data for now (will be replaced with Firestore later) ---
// const initialDummyNotes = [
//   {
//     id: "1",
//     title: "Welcome to DevNotes Desktop",
//     body: "This is a dummy note. Later, this will sync with Firebase.",
//     tags: ["demo", "desktop"]
//   },
//   {
//     id: "2",
//     title: "Second note",
//     body: "You can edit this text, switch between notes, and add new ones.",
//     tags: ["idea"]
//   }
// ];

let notes = [];
let selectedId = null;
let notesLoading = false;
let notesError = null;

let lastSyncedAt = null; // Date object or null
let isSyncing = false;

// --- Utility to escape HTML ---
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[c] || c;
  });
}

// --- Utility to format time ---
function formatTime(date) {
  if (!date) return "Never";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// --- Auth state listener ---
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  authReady = true;
  authError = null;
  authLoading = false;

  if (currentUser) {
    // Load notes once on login
    await loadNotesForUser(currentUser.uid);
  } else {
    // Clear everything on logout
    notes = [];
    selectedId = null;
    notesError = null;
    notesLoading = false;
    lastSyncedAt = null;
    isSyncing = false;
    render();
  }
});


// --- Rendering ---

function render() {
  const app = document.getElementById("app");
  if (!app) return;

  // While auth is initializing
  if (!authReady) {
    app.innerHTML = `
      <div class="center-screen">
        <div class="loader"></div>
        <p>Loading...</p>
      </div>
    `;
    return;
  }

  // If not logged in, show auth screen
  if (!currentUser) {
    app.innerHTML = `
      <div class="auth-shell">
        <div class="auth-card">
          <h1 class="auth-title">DevNotes Desktop</h1>
          <p class="auth-subtitle">Sign in to access your notes.</p>

          <div class="auth-tabs">
            <button
              class="auth-tab ${authMode === "login" ? "is-active" : ""}"
              data-mode="login"
            >
              Login
            </button>
            <button
              class="auth-tab ${authMode === "register" ? "is-active" : ""}"
              data-mode="register"
            >
              Register
            </button>
          </div>

          <form id="authForm" class="auth-form">
            <label class="auth-label">
              Email
              <input
                id="authEmail"
                type="email"
                class="auth-input"
                required
              />
            </label>

            <label class="auth-label">
              Password
              <input
                id="authPassword"
                type="password"
                class="auth-input"
                required
              />
            </label>

            ${authError
        ? `<p class="auth-error">${escapeHtml(authError)}</p>`
        : ""
      }

            <button
              class="btn btn-primary btn-full"
              type="submit"
              ${authLoading ? "disabled" : ""}
            >
              ${authLoading
        ? "Please wait..."
        : authMode === "login"
          ? "Login"
          : "Create account"
      }
            </button>
          </form>
        </div>
      </div>
    `;
    wireAuthEvents();
    return;
  }

  // If logged in, show notes UI
  const selectedNote = notes.find((n) => n.id === selectedId) || null;

  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div class="app-title">DevNotes Desktop</div>
        <div class="app-header-right">
          <div class="sync-info">
            <button
              class="btn btn-ghost btn-small"
              id="refreshNotesBtn"
              ${isSyncing ? "disabled" : ""}
            >
              ${isSyncing ? "Syncing..." : "Refresh"}
            </button>
            <span class="sync-label">
              Last synced: ${formatTime(lastSyncedAt)}
            </span>
          </div>
          <span class="app-user-email">${escapeHtml(
          currentUser.email || ""
        )}</span>
          <button class="btn btn-ghost" id="logoutBtn">Logout</button>
        </div>
      </header>


      <div class="app-body">
        <aside class="sidebar">
          <button class="btn btn-primary btn-full" id="newNoteBtn">
            + New Note
          </button>

          <div class="sidebar-search">
            <input
              id="searchInput"
              type="text"
              placeholder="Search notes..."
            />
          </div>

          <div class="sidebar-list" id="notesList">
            ${notes
      .map(
        (note) => `
              <div
                class="note-list-item ${note.id === selectedId ? "is-selected" : ""
          }"
                data-id="${note.id}"
              >
                <div class="note-title">
                  ${escapeHtml(note.title || "Untitled")}
                </div>
                <div class="note-tags">
                  ${(note.tags || [])
            .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
            .join("")}
                </div>
              </div>
            `
      )
      .join("")}
          </div>
        </aside>

        <main class="editor">
          ${selectedNote
      ? `
            <div class="editor-header">
              <input
                id="titleInput"
                class="editor-title"
                type="text"
                value="${escapeHtml(selectedNote.title || "")}"
                placeholder="Note title"
              />
            </div>

            <div class="editor-body">
              <textarea
                id="bodyInput"
                class="editor-textarea"
                rows="16"
                placeholder="Write your note here..."
              >${escapeHtml(selectedNote.body || "")}</textarea>
            </div>

            <div class="editor-footer">
              <input
                id="tagsInput"
                class="editor-tags-input"
                type="text"
                value="${escapeHtml((selectedNote.tags || []).join(", "))}"
                placeholder="tags, comma, separated"
              />
              <button class="btn btn-danger" id="deleteNoteBtn">Delete</button>
            </div>
          `
      : `
            <div class="editor-empty">
              <p>Select a note from the left or create a new one.</p>
            </div>
          `
    }
        </main>
      </div>
    </div>
  `;

  wireNotesEvents();
}

// --- Auth events ---
function wireAuthEvents() {
  const authForm = document.getElementById("authForm");
  const emailInput = document.getElementById("authEmail");
  const passwordInput = document.getElementById("authPassword");
  const tabs = document.querySelectorAll(".auth-tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      authMode = tab.getAttribute("data-mode") || "login";
      authError = null;
      render();
    });
  });

  if (authForm && emailInput && passwordInput) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      authLoading = true;
      authError = null;
      render();

      try {
        if (authMode === "login") {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } catch (err) {
        authError = err.message || "Authentication failed.";
        authLoading = false;
        render();
      }
    });
  }
}

// --- Notes events ---
function wireNotesEvents() {
  // New note
  const newNoteBtn = document.getElementById("newNoteBtn");
  if (newNoteBtn) {
    newNoteBtn.addEventListener("click", async () => {
      if (!currentUser) return;
      try {
        await createNoteForUser(currentUser.uid);
      } catch (err) {
        console.error("Error creating note:", err);
        notesError = err.message || "Failed to create note.";
        render();
      }
    });
  }


  // Refresh notes
  const refreshBtn = document.getElementById("refreshNotesBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      if (!currentUser || isSyncing) return;
      await loadNotesForUser(currentUser.uid);
    });
  }

  // Note selection
  const notesList = document.getElementById("notesList");
  if (notesList) {
    notesList.addEventListener("click", (e) => {
      const item = e.target.closest(".note-list-item");
      if (!item) return;
      const id = item.getAttribute("data-id");
      selectedId = id;
      render();
    });
  }

  // Delete note
  const deleteNoteBtn = document.getElementById("deleteNoteBtn");
  if (deleteNoteBtn) {
    deleteNoteBtn.addEventListener("click", async () => {
      if (!selectedId) return;
      const confirmDelete = confirm("Delete this note?");
      if (!confirmDelete) return;
      try {
        await deleteNoteFromFirestore(selectedId);
      } catch (err) {
        console.error("Error deleting note:", err);
        notesError = err.message || "Failed to delete note.";
        render();
      }
    });
  }



  // Edit title/body/tags (on blur)
  const titleInput = document.getElementById("titleInput");
  const bodyInput = document.getElementById("bodyInput");
  const tagsInput = document.getElementById("tagsInput");

  if (titleInput) {
    titleInput.addEventListener("blur", async () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      const newTitle = titleInput.value;
      try {
        await updateNoteInFirestore(note.id, { title: newTitle });
      } catch (err) {
        console.error("Error updating title:", err);
        notesError = err.message || "Failed to update note.";
        render();
      }
    });
  }

  if (bodyInput) {
    bodyInput.addEventListener("blur", async () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      const newBody = bodyInput.value;
      try {
        await updateNoteInFirestore(note.id, { body: newBody });
      } catch (err) {
        console.error("Error updating body:", err);
        notesError = err.message || "Failed to update note.";
        render();
      }
    });
  }


  if (tagsInput) {
    tagsInput.addEventListener("blur", async () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      try {
        await updateNoteInFirestore(note.id, { tags });
      } catch (err) {
        console.error("Error updating tags:", err);
        notesError = err.message || "Failed to update note.";
        render();
      }
    });
  }


  // Search (keeping it local for now)
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const term = searchInput.value.toLowerCase();

      if (!term) {
        notes = [...initialDummyNotes];
      } else {
        notes = initialDummyNotes.filter(
          (n) =>
            (n.title || "").toLowerCase().includes(term) ||
            (n.body || "").toLowerCase().includes(term)
        );
      }
      selectedId = notes[0]?.id ?? null;
      render();
    });
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
    });
  }
}

//Notes helper functions
async function loadNotesForUser(uid) {
  if (!uid) return;
  notesLoading = true;
  isSyncing = true;
  notesError = null;
  render();

  try {
    const notesRef = collection(db, "notes");
    const q = query(
      notesRef,
      where("userId", "==", uid),
      orderBy("updatedAt", "desc")
    );

    const snapshot = await getDocs(q);
    notes = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || "",
        body: data.body || "",
        tags: data.tags || [],
        pinned: data.pinned || false,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    });

    if (!selectedId && notes.length) {
      selectedId = notes[0].id;
    } else if (selectedId && !notes.find((n) => n.id === selectedId)) {
      selectedId = notes[0]?.id ?? null;
    }

    lastSyncedAt = new Date();
  } catch (err) {
    console.error("Error loading notes:", err);
    notesError = err.message || "Failed to load notes.";
  } finally {
    notesLoading = false;
    isSyncing = false;
    render();
  }
}

async function createNoteForUser(uid) {
  if (!uid) return null;
  const now = serverTimestamp();

  const docRef = await addDoc(collection(db, "notes"), {
    userId: uid,
    title: "Untitled note",
    body: "",
    tags: [],
    pinned: false,
    createdAt: now,
    updatedAt: now
  });

  // Optimistically add to local list
  notes = [
    {
      id: docRef.id,
      title: "Untitled note",
      body: "",
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now
    },
    ...notes
  ];
  selectedId = docRef.id;
  render();
  return docRef.id;
}

async function updateNoteInFirestore(id, payload) {
  if (!id) return;
  const noteRef = doc(db, "notes", id);

  await updateDoc(noteRef, {
    ...payload,
    updatedAt: serverTimestamp()
  });

  // Update local copy
  notes = notes.map((n) =>
    n.id === id ? { ...n, ...payload } : n
  );
  render();
}

async function deleteNoteFromFirestore(id) {
  if (!id) return;
  await deleteDoc(doc(db, "notes", id));

  notes = notes.filter((n) => n.id !== id);
  if (selectedId === id) {
    selectedId = notes[0]?.id ?? null;
  }
  render();
}

// Initial render (in case authReady becomes true asynchronously)
render();
