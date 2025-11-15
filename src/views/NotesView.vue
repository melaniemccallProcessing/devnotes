<template>
  <section class="section">
    <Navbar @logout="handleLogout" />

    <div class="container mt-4">
      <div class="columns">
        <!-- Sidebar -->
        <div class="column is-3">
          <div class="box">
            <button
              class="button is-primary is-fullwidth"
              @click="handleNewNote"
              :class="{ 'is-loading': loadingNotes }"
            >
              + New Note
            </button>

            <div class="field mt-4">
              <p class="label is-small">Search</p>
              <div class="control">
                <input
                  v-model="search"
                  type="text"
                  class="input"
                  placeholder="Search notes..."
                />
              </div>
            </div>

            <p class="is-size-7 has-text-grey mt-2">
              {{ filteredNotes.length }} note(s)
            </p>
          </div>
        </div>

        <!-- Notes + Editor -->
        <div class="column is-9">
          <div class="columns">
            <div class="column is-4">
              <NoteList
                :notes="filteredNotes"
                :selectedId="selectedId"
                @select="selectNote"
                @delete="handleDeleteNote"
              />
            </div>
            <div class="column is-8">
              <NoteEditor
                v-if="currentNote"
                :note="currentNote"
                @update="handleUpdateNote"
              />
              <div v-else class="box has-text-grey">
                Select a note or create a new one to start writing.
              </div>
            </div>
          </div>

          <p v-if="notesError" class="has-text-danger mt-3">
            {{ notesError }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import Navbar from "../components/Navbar.vue";
import NoteList from "../components/NoteList.vue";
import NoteEditor from "../components/NoteEditor.vue";
import useAuth from "../composables/useAuth";
import useNotes from "../composables/useNotes";

const { logout } = useAuth();
const {
  notes,
  loadingNotes,
  notesError,
  fetchNotes,
  createNote,
  updateNote,
  removeNote
} = useNotes();

const selectedId = ref(null);
const search = ref("");

onMounted(async () => {
  await fetchNotes();
});

const filteredNotes = computed(() => {
  const term = search.value.toLowerCase();
  if (!term) return notes.value;
  return notes.value.filter(
    (n) =>
      n.title.toLowerCase().includes(term) ||
      n.body.toLowerCase().includes(term)
  );
});

const currentNote = computed(() =>
  notes.value.find((n) => n.id === selectedId.value)
);

const handleNewNote = async () => {
  const id = await createNote();
  if(id) {
    selectedId.value = id;
  }
};

const selectNote = (id) => {
  selectedId.value = id;
};

const handleUpdateNote = async (payload) => {
  if (!currentNote.value) return;
  await updateNote(currentNote.value.id, payload);
};

const handleDeleteNote = async (id) => {
  if (confirm("Delete this note?")) {
    await removeNote(id);
    if (selectedId.value === id) selectedId.value = null;
  }
};

const handleLogout = async () => {
  await logout();
};
</script>
