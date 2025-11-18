// desktop/src/main.js

import {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "./firebase";

// --- Auth state ---
let currentUser = null;
let authReady = false;
let authMode = "login"; // "login" | "register"
let authError = null;
let authLoading = false;

// --- Dummy data for now (will be replaced with Firestore later) ---
const initialDummyNotes = [
  {
    id: "1",
    title: "Welcome to DevNotes Desktop",
    body: "This is a dummy note. Later, this will sync with Firebase.",
    tags: ["demo", "desktop"]
  },
  {
    id: "2",
    title: "Second note",
    body: "You can edit this text, switch between notes, and add new ones.",
    tags: ["idea"]
  }
];

let notes = [...initialDummyNotes];
let selectedId = notes[0]?.id ?? null;

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

// --- Auth state listener ---
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  authReady = true;
  authError = null;
  authLoading = false;

  // Later: fetch notes from Firestore when user logs in
  // For now, just reset dummy notes
  notes = [...initialDummyNotes];
  selectedId = notes[0]?.id ?? null;

  render();
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

            ${
              authError
                ? `<p class="auth-error">${escapeHtml(authError)}</p>`
                : ""
            }

            <button
              class="btn btn-primary btn-full"
              type="submit"
              ${authLoading ? "disabled" : ""}
            >
              ${
                authLoading
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
                class="note-list-item ${
                  note.id === selectedId ? "is-selected" : ""
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
          ${
            selectedNote
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
    newNoteBtn.addEventListener("click", () => {
      const id = String(Date.now());
      const newNote = {
        id,
        title: "Untitled note",
        body: "",
        tags: []
      };
      notes = [newNote, ...notes];
      selectedId = id;
      render();
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
    deleteNoteBtn.addEventListener("click", () => {
      if (!selectedId) return;
      const confirmDelete = confirm("Delete this note?");
      if (!confirmDelete) return;
      notes = notes.filter((n) => n.id !== selectedId);
      selectedId = notes[0]?.id ?? null;
      render();
    });
  }

  // Edit title/body/tags (on blur)
  const titleInput = document.getElementById("titleInput");
  const bodyInput = document.getElementById("bodyInput");
  const tagsInput = document.getElementById("tagsInput");

  if (titleInput) {
    titleInput.addEventListener("blur", () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      note.title = titleInput.value;
      render();
    });
  }

  if (bodyInput) {
    bodyInput.addEventListener("blur", () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      note.body = bodyInput.value;
      // Not re-rendering immediately to avoid cursor jump
    });
  }

  if (tagsInput) {
    tagsInput.addEventListener("blur", () => {
      const note = notes.find((n) => n.id === selectedId);
      if (!note) return;
      note.tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      render();
    });
  }

  // Search (still operates on dummy data for now)
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

// Initial render (in case authReady becomes true asynchronously)
render();
