# DevNotes Cloud
Cross-Platform Notes App — Web + Desktop

A developer-friendly notes ecosystem powered by Vue, Firebase, and Tauri.

DevNotes Cloud is a dual-client notes application designed for developers who want a clean, simple, synced workspace — anywhere. The project includes:

A Vue 3 web client

A Tauri desktop client (HTML/CSS/JS + Rust backend)

A shared Firebase backend (Auth + Firestore)

A consistent note schema and UI across both platforms

The goal: a fast, elegant, distraction-free note-taking experience that works across browsers and native desktop apps.

## Project Structure
``` 
devnotes-cloud/               # ← You are here (root overview)
  web/                    # Vue 3 web client
    src/
    index.html
    firebase.js
    ...
  desktop/                # Tauri desktop client
      index.html
      main.js
      firebase.js
      style.css
      ...
    src-tauri/
      main.rs
      tauri.conf.json
      Cargo.toml

```

Both clients read + write to the same Firestore collections and use the same Firebase Auth project.

 # Features (Shared Across Web + Desktop)

## Authentication (Firebase)
-Login & registration via email/password
-Logged-in users only see their own notes
-Firestore rules enforce user isolation

## Notes
-Create, edit, delete
-Markdown-friendly body
-Comma-separated tags
-Pinned notes (schema supports this even if UI doesn’t display them yet)

## Search
-Local search filtering by title/body
-Instant results

## Sync & Data Flow
-Unified Firestore schema
-Manual Refresh button on desktop
-“Last synced at…” label for transparency
-Desktop writes are synced to Firestore immediately
-Web client receives real-time updates via Firestore listeners
-Desktop updates via manual refresh (simpler + predictable)

## Design / UX

-Clean two-pane layout (sidebar + editor)
-Responsive web UI (Bulma CSS)
-Lightweight desktop UI (vanilla HTML/CSS with custom styling)

# Web App (Vue 3)

The web app lives under /web.

##Tech
-Vue 3 (Vite)
-Composition API
-Firebase Auth + Firestore
-Bulma CSS
-Alpine.js micro-interaction banner (route-aware)

## Highlights
-Real-time Firestore updates with onSnapshot()
-Route guards for protected pages
-Search bar + dynamic filtering
-Clean, responsive layout
-Environment-variable based Firebase config

## Run Web App
```cd web
npm install
npm run dev
```

# Desktop App (Tauri)

The desktop app lives under /desktop.
It uses a Rust Tauri backend + Vanilla JavaScript frontend.

## Tech
-Tauri (Rust)
-HTML, CSS, JavaScript
-Firebase Auth + Firestore
-Optional Vite frontend bundling (hides environment variables)
-Cross-platform builds (Windows/macOS/Linux)

## Highlights
-Native window + packaging
-Login/register via Firebase
-Notes synced with Firestore
-Manual refresh to pull updates
-“Last synced at…” label
-Small application footprint (<10 MB builds)

## Run Desktop App
```cd desktop
npm install
npm run tauri dev
```

## Build production installer:

```npm run tauri build```

## Unified Firestore Schema

All notes across both clients share the same structure:

```{
  "userId": "UID",
  "title": "string",
  "body": "string",
  "tags": ["tag1", "tag2"],
  "pinned": false,
  "createdAt": timestamp,
  "updatedAt": timestamp
}
```
## Firestore Security Rules
```rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // All notes live under /notes/{noteId}
    match /notes/{noteId} {
      allow read, write: if isOwner();

      function isOwner() {
        return request.auth != null
          && request.auth.uid == resource.data.userId;
      }

      allow create, update: if validNote() && isOwnerOnCreateUpdate();

      function isOwnerOnCreateUpdate() {
        return request.auth != null
          && request.auth.uid == request.resource.data.userId;
      }

      function validNote() {
        return
          request.resource.data.keys().hasAll(["userId", "title", "body", "createdAt", "updatedAt"]) &&
          request.resource.data.keys().hasOnly(["userId", "title", "body", "tags", "pinned", "createdAt", "updatedAt"]) &&
          request.resource.data.userId is string &&
          request.resource.data.title is string &&
          request.resource.data.body is string &&
          (!("tags" in request.resource.data) || request.resource.data.tags is list) &&
          (!("pinned" in request.resource.data) || request.resource.data.pinned is bool) &&
          request.resource.data.createdAt is timestamp &&
          request.resource.data.updatedAt is timestamp;
      }
    }
  }
}
```

## Environment Variables

Create .env files in /web and /desktop:

```VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Do not commit your .env; add them to .gitignore.

# Roadmap
## Completed
-Web client (Vue 3 + Firebase)
-Desktop client (Tauri + JS)
-CRUD notes
-Search
-Tags
-Auth
-Manual desktop sync
-Cross-platform support

## Possible Future Enhancements

-Markdown preview mode
-Pinned notes UI section
-Drag-to-reorder notes
-Bi-directional real-time sync on desktop
-Mobile app (Capacitor/Tauri Mobile)

# Author

Melanie Diaz ---
Frontend Developer • Educator ---
Atlanta, GA
