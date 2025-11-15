// src/composables/useNotes.js
import { ref, computed } from "vue";
import {
  db,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "../firebase";
import useAuth from "./useAuth";

const notes = ref([]);
const loadingNotes = ref(false);
const notesError = ref(null);

function useNotes() {
  const { user } = useAuth();

  const fetchNotes = async () => {
    if (!user.value) return;
    loadingNotes.value = true;
    notesError.value = null;

    try {
      const notesRef = collection(db, "notes");
      const q = query(
        notesRef,
        where("userId", "==", user.value.uid),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      notes.value = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
    } catch (err) {
      notesError.value = err.message;
    } finally {
      loadingNotes.value = false;
    }
  };

  const createNote = async () => {
    if (!user.value) return;
    const now = serverTimestamp();
    const noteRef = await addDoc(collection(db, "notes"), {
      userId: user.value.uid,
      title: "Untitled note",
      body: "",
      tags: [],
      pinned: false,
      createdAt: now,
      updatedAt: now
    });
    await fetchNotes();
    return noteRef.id;
  };

  const updateNote = async (id, payload) => {
    if (!id) return;
    const noteRef = doc(db, "notes", id);
    await updateDoc(noteRef, {
      ...payload,
      updatedAt: serverTimestamp()
    });
    await fetchNotes();
  };

  const removeNote = async (id) => {
    if (!id) return;
    await deleteDoc(doc(db, "notes", id));
    await fetchNotes();
  };

  const pinnedNotes = computed(() =>
    notes.value.filter((n) => n.pinned)
  );
  const otherNotes = computed(() =>
    notes.value.filter((n) => !n.pinned)
  );

  return {
    notes,
    pinnedNotes,
    otherNotes,
    loadingNotes,
    notesError,
    fetchNotes,
    createNote,
    updateNote,
    removeNote
  };
}

export default useNotes;
