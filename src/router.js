// src/router.js
import { createRouter, createWebHistory } from "vue-router";
import LoginView from "./views/LoginView.vue";
import NotesView from "./views/NotesView.vue";
import { auth } from "./firebase";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView
  },
  {
    path: "/",
    name: "notes",
    component: NotesView,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Auth guard
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser;

  if (to.meta.requiresAuth && !currentUser) {
    next({ name: "login" });
  } else if (to.name === "login" && currentUser) {
    next({ name: "notes" });
  } else {
    next();
  }
});

export default router;
