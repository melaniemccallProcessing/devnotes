DevNotes Cloud — Web App

A clean, synced notes app for developers, built with Vue 3, Firebase, and Bulma.

DevNotes Cloud is a cross-platform notes app designed for developers who want a fast, distraction-free place to jot ideas, write drafts, store documentation, tag notes, and sync them across web and desktop.

This README covers the Web App, built with Vue + Vite.

🚀 Features
Core

🔐 Firebase Authentication (email/password)

📝 Create, edit, delete notes

🔄 Real-time syncing with Firestore

🔎 Search by title or content

🏷️ Tag support (comma-separated)

✍️ Markdown-friendly editing

🧩 Modular logic via Vue Composition API

UI / UX

📱 Responsive design (Bulma CSS)

🧭 Clean sidebar layout (notes list)

🖱️ Inline editing with autosave

🪄 Smooth transitions + a small Alpine.js enhancement

Architecture

Vue 3

Vue Router

Firebase (Auth + Firestore)

Bulma CSS

Alpine.js (for non-Vue micro-interaction banner)

Environment-variable based config (secure)

🛠️ Tech Stack
Frontend

Vue 3 (Vite)

Composition API

Vue Router

Bulma CSS

Alpine.js (banner component)

Backend / Cloud

Firebase Authentication

Firestore Database

Firebase Hosting (deployed on Google Cloud)

📦 Project Structure
src/
  firebase.js         # Firebase init + Firestore + Auth
  router.js           # Routes + auth guard
  main.js             # Vue bootstrap + Alpine initialization
  App.vue
  style.css           # Optional global styles

  composables/
    useAuth.js        # Login/Register/Logout logic
    useNotes.js       # CRUD logic for notes

  views/
    LoginView.vue     # Auth screen
    NotesView.vue     # Main notes app

  components/
    Navbar.vue
    NoteList.vue
    NoteEditor.vue

🔧 Environment Setup
1. Install dependencies
npm install

2. Create a .env file at the root:
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id


⚠️ Never commit .env files.
Your .gitignore should include:

.env
.env.local

🔥 Firestore Security Rules

These ensure users can only access their own notes:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notes/{noteId} {
      allow read, update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId;

      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.userId;
    }
  }
}

▶️ Running the App (Dev)
npm run dev


App will be available at:

http://localhost:5173

🌐 Deploying to Firebase Hosting

Make sure Firebase CLI is installed:

npm install -g firebase-tools


Then:

firebase login
firebase init hosting
firebase deploy


Your web app is now deployed globally via Google Cloud infra.

🧩 Alpine.js Enhancement

This project includes a small Alpine-based dismissible tip banner that:

Lives in index.html

Is controlled by Vue Router via banner-show and banner-hide events

Demonstrates comfort with Alpine.js outside Vue’s SFC lifecycle

🧭 Roadmap
Completed

 Authentication

 Notes CRUD

 Tags + Search

 Alpine.js enhancement banner

 Responsive UI

Planned

 Markdown preview mode

 Dark mode

 Keyboard shortcuts

 Offline caching

 Desktop client (Rust + Dioxus + Tauri)

🧑‍💻 Author

Melanie Diaz
Front-End Developer • Educator
Atlanta, GA