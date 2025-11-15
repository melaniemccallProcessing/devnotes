<template>
  <div class="box notes-list">
    <aside class="menu">
      <p class="menu-label">Notes</p>
      <ul class="menu-list">
        <li
          v-for="note in notes"
          :key="note.id"
        >
          <a
            @click="$emit('select', note.id)"
            :class="{ 'has-background-link-light': note.id === selectedId }"
            class="is-flex is-justify-content-space-between"
          >
            <span class="mr-2">
              {{ note.title || "Untitled" }}
            </span>
            <button
              class="delete is-small"
              @click.stop="$emit('delete', note.id)"
            ></button>
          </a>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script setup>
defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: String,
    default: null
  }
});

defineEmits(["select", "delete"]);
</script>

<style scoped>
.notes-list {
  max-height: 70vh;
  overflow-y: auto;
}
</style>
