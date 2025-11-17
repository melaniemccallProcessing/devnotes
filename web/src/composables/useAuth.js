// src/composables/useAuth.js
import { ref } from "vue";
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "../firebase";

const user = ref(null);
const authReady = ref(false);

onAuthStateChanged(auth, (u) => {
  user.value = u;
  authReady.value = true;
});

function useAuth() {
  const error = ref(null);
  const loading = ref(false);

  const login = async (email, password) => {
    error.value = null;
    loading.value = true;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const register = async (email, password) => {
    error.value = null;
    loading.value = true;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return {
    user,
    authReady,
    error,
    loading,
    login,
    register,
    logout
  };
}

export default useAuth;
