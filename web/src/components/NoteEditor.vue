<template>
  <div class="box">
    <div class="field">
      <input
        v-model="localNote.title"
        class="input is-medium"
        placeholder="Note title"
        @blur="emitUpdate"
      />
    </div>

    <div class="field">
      <textarea
        v-model="localNote.body"
        class="textarea"
        rows="12"
        placeholder="Write your note in Markdown..."
        @blur="emitUpdate"
      ></textarea>
    </div>

    <div class="field">
      <label class="label is-small">Tags (comma separated)</label>
      <input
        v-model="tagsInput"
        class="input is-small"
        @blur="emitUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from "vue";

const props = defineProps({
  note: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(["update"]);

const localNote = reactive({
  title: props.note.title,
  body: props.note.body,
  tags: props.note.tags || []
});

const tagsInput = computed({
  get() {
    return (localNote.tags || []).join(", ");
  },
  set(val) {
    localNote.tags = val
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
});

watch(
  () => props.note,
  (newNote) => {
    localNote.title = newNote.title;
    localNote.body = newNote.body;
    localNote.tags = newNote.tags || [];
  },
  { deep: true }
);

const emitUpdate = () => {
  emit("update", {
    title: localNote.title,
    body: localNote.body,
    tags: localNote.tags
  });
};
</script>
