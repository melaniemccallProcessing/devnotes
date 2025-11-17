<template>
  <nav class="navbar" role="navigation">
    <div class="navbar-brand">
      <a class="navbar-item">
        <strong>DevNotes Cloud</strong>
      </a>
    </div>

    <div class="navbar-menu is-active">
      <div class="navbar-end">
        <div class="navbar-item">
          <button class="button is-light" @click="$emit('logout')">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
// Very simple navbar; auth handled in parent
</script>
