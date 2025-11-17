## Desktop App

The `/desktop` folder contains the Tauri-based desktop client for DevNotes Cloud.

- Framework: Tauri
- Language: Rust (via `src-tauri`)
- Frontend: Temporary starter template (to be replaced with Dioxus-based UI)
- Shared backend: Same Firebase Auth + Firestore project as the web app

To run:

```bash
cd desktop
npm install
npm run tauri dev