import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import "bulma/css/bulma.css";
import {auth, onAuthStateChanged} from "./firebase";

let app;

onAuthStateChanged(auth, () => {
  // Ensure we mount only once auth state is resolved
  if (!app) {
    app = createApp(App);
    app.use(router);
    app.mount("#app");
  }
});