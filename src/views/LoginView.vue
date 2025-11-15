<template>
  <section class="hero is-fullheight is-light">
    <div class="hero-body">
      <div class="container">
        <div class="columns is-centered">
          <div class="column ">
            <h1 class="title has-text-centered">DevNotes Cloud</h1>

            <div class="box">
              <div class="tabs is-toggle is-fullwidth">
                <ul>
                  <li :class="{ 'is-active': mode === 'login' }">
                    <a @click="mode = 'login'">Login</a>
                  </li>
                  <li :class="{ 'is-active': mode === 'register' }">
                    <a @click="mode = 'register'">Register</a>
                  </li>
                </ul>
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="field">
                  <label class="label">Email</label>
                  <div class="control">
                    <input
                      v-model="email"
                      class="input"
                      type="email"
                      required
                    />
                  </div>
                </div>

                <div class="field">
                  <label class="label">Password</label>
                  <div class="control">
                    <input
                      v-model="password"
                      class="input"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <p v-if="error" class="help is-danger">{{ error }}</p>

                <div class="field mt-4">
                  <div class="control">
                    <button
                      class="button is-primary is-fullwidth"
                      :class="{ 'is-loading': loading }"
                      type="submit"
                    >
                      {{ mode === "login" ? "Login" : "Create account" }}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p class="has-text-centered is-size-7 has-text-grey">
              Simple synced notes for developers.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import useAuth from "../composables/useAuth";

const router = useRouter();
const { user, error, loading, login, register } = useAuth();

const mode = ref("login");
const email = ref("");
const password = ref("");

watch(user, (val) => {
  if (val) {
    router.push({ name: "notes" });
  }
});

const handleSubmit = async () => {
  if (mode.value === "login") {
    await login(email.value, password.value);
  } else {
    await register(email.value, password.value);
  }
};
</script>
