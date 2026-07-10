# FlowTube — Setup Guide

This is a real, runnable project connected to your Firebase account. Follow these steps in order.

## 1. Finish Firebase setup (in the Firebase console, in your browser)
- **Authentication → Sign-in method → Email/Password → Enable**
- **Firestore Database → Create database → Start in test mode**

Test mode allows open read/write for 30 days — fine for building, but tighten the
rules before you launch publicly (Firestore → Rules).

## 2. Install Node.js (one-time, on your computer)
Download and install from https://nodejs.org (choose the LTS version). This gives
you `npm`, the tool used to install and run the project.

## 3. Open this folder in a terminal
- Windows: open the `flowtube` folder, then right-click → "Open in Terminal"
- Mac: open Terminal, type `cd ` (with a space), drag the `flowtube` folder in, press Enter

## 4. Install dependencies
```
npm install
```
This downloads React, Firebase, and the icon library used by the app.

## 5. Run it locally
```
npm run dev
```
Terminal will show a link like `http://localhost:5173` — open that in your browser.
You now have a working app: sign up, log in, upload, like, comment, subscribe —
all saved permanently in your Firebase project.

## 6. Put it on the web (so you have a real URL)
The easiest free option is **Vercel**:
1. Go to https://vercel.com, sign up with GitHub
2. Push this folder to a GitHub repo (or use Vercel's drag-and-drop deploy)
3. Vercel auto-detects Vite and gives you a live URL like `flowtube.vercel.app`

## 7. Turn it into an installable APK
Once it's live on a URL:
1. Go to https://www.pwabuilder.com
2. Paste your live URL
3. Click "Package for stores" → Android
4. Download the generated APK — that's the file you can install on a phone
   right now, and it's also what you'd upload to Google Play later

## 8. Publish on Google Play (when ready)
- Create a Google Play Developer account (one-time $25 fee) at
  https://play.google.com/console
- Upload the APK/AAB from step 7, fill in store listing details, submit for review

## What's still missing (next steps to ask Claude for)
- **Real video file uploads** — right now uploads save title/description/category
  to the database, but the actual video file playback uses sample clips. Real
  video hosting needs a storage service (e.g. Cloudinary, Mux, or Firebase
  Storage on the paid Blaze plan) — ask to add this next.
- **Tightening Firestore security rules** before launch.
- **Push notifications**, **video recommendations**, **Shorts as real videos**.
