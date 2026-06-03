# Offline and backend architecture

## Decision

Backend is not required for the core trainer.

JTrain should be local-first:

- Study datasets are bundled into the frontend from `src/data`.
- SRS progress, weak spots, settings, and session history are stored in browser local storage.
- Audio should use local files from `public/audio` when available, with Web Speech as fallback.
- The production frontend registers a service worker that caches the app shell and same-origin resources after the first successful load.

This supports the desired behavior: if the user has opened the trainer before and the browser has cached the app, they can keep training without internet.

## What works offline

- Kana, kanji, words, sentences, and particles that are bundled in the app.
- SRS scheduling and progress updates.
- Weak-card detection.
- Drawing exercises implemented in the frontend.
- Local audio files already cached by the browser/service worker.
- Web Speech synthesis only when the browser/OS provides the required voice offline.

## What may require internet or browser support

- Browser speech recognition. Many browsers route recognition through online services.
- Remote audio files, if cards point to external URLs.
- Cross-device sync.
- User accounts.
- Server-side recommendations or analytics.
- Downloading new lesson packs after deployment.

## Role of the existing Go backend

The backend remains useful, but optional:

- Serving large datasets from PostgreSQL.
- Importing/bootstraping source datasets.
- Admin tools for content management.
- Syncing progress across devices.
- Accounts and backups.
- Future API-driven content packs.

The frontend should not depend on the backend for its base study flow. If API data is introduced again, it should use a local-data fallback and preferably cache fetched content in IndexedDB for offline reuse.

## Current implementation direction

The current app uses `allStudyCards` from local data in `App.tsx`, so the main screens are already backend-independent.

The PWA layer adds:

- `public/manifest.webmanifest` for installability metadata.
- `public/service-worker.js` for app-shell and runtime resource caching.
- Service worker registration in `src/main.tsx`.

The service worker is registered only in the built app, not in the Vite dev server.

## Future offline upgrades

Recommended next steps:

- Move progress from `localStorage` to IndexedDB when the data model grows.
- Cache generated or downloaded lesson packs in IndexedDB.
- Add a visible offline/online indicator.
- Add a "download all audio" action for users who want reliable offline audio.
- Add export/import backup for progress; current settings already include JSON import/export.
- Treat microphone pronunciation as optional and explain availability in settings.

