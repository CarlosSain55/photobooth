# PIX55 — An Online Photo Booth

A React + Vite rebuild of the PIX55 photo booth: solo strips or a two-browser
"duo" session over a direct peer-to-peer video call, with real login
(email/password, Google) or guest access via Firebase Authentication.

## Project layout

```
src/
  main.jsx                entry point
  App.jsx                 auth gate: loading / login / booth app
  firebase.js             Firebase app + auth initialization
  context/
    AuthContext.jsx        user session state, sign in/up/out
    BoothContext.jsx        booth wizard state (screen, mode, filters, shots...)
  hooks/
    useLocalCamera.js       getUserMedia lifecycle
    usePeerSession.js       PeerJS host/join/data-channel logic
  lib/
    filters.js, frames.js   style presets
    compositor.js           canvas capture + strip assembly
    roomCode.js             room code generator
  components/
    auth/Login.jsx
    layout/                 Marquee, Footer, UserBadge
    home/HomeScreen.jsx
    duo/DuoSetupScreen.jsx
    stage/                  StageScreen, FilterPicker, FilmstripRail
    result/                 DevelopingScreen, ResultScreen, FramePicker
  styles/                   theme.css, layout.css, stage.css, result.css, auth.css
```

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Create a Firebase project at https://console.firebase.google.com, then in
   **Authentication > Sign-in method** enable the **Email/Password**,
   **Google**, and **Anonymous** providers.

3. Copy `.env.example` to `.env` and fill in your Firebase web app config
   (Project settings > General > Your apps > SDK setup and configuration):

   ```
   cp .env.example .env
   ```

4. Run the dev server:

   ```
   npm run dev
   ```

5. Build for production:

   ```
   npm run build
   ```

## Notes

Duo sessions connect two browsers directly using PeerJS's public broker
for introductions — fine for sharing between friends, but a production
booth would want its own signaling & TURN server for reliability behind
restrictive NATs/firewalls.
