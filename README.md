# 🎬 **Jellydash** – A Jellyfin Management Dashboard

**Jellydash** is a self-hosted web dashboard that **enhances and simplifies** the management of your Jellyfin server, filling the gaps left by the default Jellyfin dashboard.

It ships as a full Next.js web app — log in with your existing Jellyfin admin account and manage users, libraries, and content straight from the browser. No separate accounts, no external database.

---

## ❓ **Why Jellydash?**

Jellyfin's default dashboard lacks several key features for **granular control**, such as:

- **No built-in user role system** (e.g., "Kids," "Adults," "Admins").
- **No global user config updates** (every change must be manual).
- **Limited sorting options** (defaults to "Date Added," which isn't always ideal).

With **Jellydash**, you regain control — **without needing external databases** (everything is stored locally in the project folder).

---

## ✨ **Key Features**

These are live and reachable from the sidebar today:

### 🔹 **User Management**

- **Browse all Jellyfin users** in a searchable table, with a per-user **Max Parental Rating**, **\*Disable User**, **Remove User** and **Can Download** options.
- **Create new users** with a **role** that controls which libraries and permissions they get, plus an auto-generated secure password.
- **Roles** – Create, rename, or delete roles. Each role can optionally have a **Max Parental Rating** cap.

### 🔹 **Content Management**

- **Parental Ratings** – parent menu with two pages:
  - **Rate Content** – Paginated grid of every Movie/Show, letting you fix wrong titles, posters, and official ratings in bulk.
  - **Manage Ratings** – Add, rename, or remove the ratings offered on the Rate Content page.
- **Delete Playlist Songs** – Upload an **`.m3u8` playlist** (from any app — Symfonium, VLC, etc) and permanently delete every listed song from disk.
- **Social Post** – Shareable social-media poster with custom template option.

### 🔹 **Libraries**

- **Sync** – Table of every library Jellyfin reports, with a badge per role (plus an `EXCLUDED` badge) — click a badge to grant or revoke that library for that role on the spot.

---

## 🧩 **Backend Features (API-only, no page yet)**

The sidebar shows a few sections with a 🔒 lock icon — these are placeholders for pages that haven't been built yet:

- **Force Jellyfin to pick up new library paths.**
- **Reorder Home libraries globally** – change the order everyone sees on their Home screen.
- **Fix missing Cast & Crew photos** in bulk.
- **Automatic Watchlist playlist** – a Jellyfin webhook listens for favorites and keeps a shared "Watchlist" playlist in sync automatically; a one-off backfill endpoint exists to catch up on favorites that existed before the webhook was wired up.
- **Re-encode a video file** – streams a file through `ffmpeg` at a given resolution and swaps it in place, with progress reported over SSE.

---

## 🚀 **Getting Started**

1. **Install dependencies**:

```bash
npm install
```

2. **Configure your `.env`** (see the **Environment Variables** section below).

3. **Run** (the dev server runs on **port 4000**, not 3000):

```bash
npm run dev
```

4. Open `http://localhost:4000/login` and sign in with your **Jellyfin admin username and password** — Jellydash authenticates you directly against your Jellyfin server, so there's no separate account to create.

5. _(Optional, for the locked/API-only features above)_ **Import** the provided Postman collection from the repo root, set the `API_URL` variable to your Jellydash app's URL, then call `AUTH_BY_NAME` (see **Authentication** below) so you can call the rest of the endpoints directly.

---

## 🔧 **Environment Variables**

```env
# Your actual Jellyfin server
SERVER_URL={YOUR_JELLYFIN_SERVER_URL}

# NextAuth (Jellydash's own login session)
NEXTAUTH_SECRET={RANDOM_SECRET}
NEXTAUTH_URL={YOUR_JELLYDASH_APP_URL}
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY={RANDOM_SECRET}

# Admin API key used for server-side/webhook calls to Jellyfin
JELLYFIN_ADMIN_API_KEY={YOUR_JELLYFIN_API_KEY}

# Shared secret required on incoming Jellyfin webhook calls
WEBHOOK_SECRET={RANDOM_SECRET}

# Optional debugging
REQUEST_LOGS=true
DEBUG_JELLYFIN_ENDPOINT=/api/webhooks

# Poster image hosting (used to build public image URLs)
NEXT_PUBLIC_IMAGE_PROTOCOL=https
NEXT_PUBLIC_IMAGE_HOSTNAME={YOUR_JELLYFIN_HOSTNAME}
NEXT_PUBLIC_ALLOWED_DEV_ORIGIN={YOUR_DEV_ORIGIN}

# Needed by the media re-encode endpoint below (Windows paths to your Jellyfin server's ffmpeg/ffprobe)
FFMPEG_PATH=C:\Program Files\Jellyfin\Server\ffmpeg.exe
FFPROBE_PATH=C:\Program Files\Jellyfin\Server\ffprobe.exe

# Custom poster/thumb used for the auto-generated Watchlist playlist
WATCHLIST_MOVIES_POSTER_PATH={PATH_TO_IMAGE}
WATCHLIST_MOVIES_THUMB_PATH={PATH_TO_IMAGE}
```

## 🔐 **Authentication**

Signing with an account that has admin permissions, that's all!

---

### 📚 **Library Sync**

## Shows every library Jellyfin currently reports in a table (Library, Roles).

### 👤 **Roles**

Lists every role from `app/db/roles.json`:

- **New Role** – creates a role with an empty library file; grant it libraries from the Sync page afterward.
- **Edit Role** – rename it and/or set a Max Parental Rating, picked from the same list managed on **Parental Ratings → Manage Ratings** (or "No cap"). The role's `id` (and its underlying library file) never changes, even if you rename it.
- **Delete Role** – removes the role and its library file. Existing users keep whatever permissions they already have.

---

### 🎵 **Delete Playlist Songs**

Available in the dashboard under **Content Management → Delete Playlist Songs**. Accepts any `.m3u8` playlist file — it doesn't have to come from Symfonium, that's just the app used to originally export the sample playlists. On the page you:

1. Pick the **Music Folder Path** with the built-in folder browser (browses folders directly on the server's own disks).
2. Optionally set the **Jellyfin path**, if the paths inside the `.m3u8` are container paths (e.g. `/media/F/Music/Vir7uaL/...` from a Dockerized Jellyfin) that need translating back to the real path on disk.
3. Upload the `.m3u8` file and confirm.

Each song is checked against the chosen folder before deletion (anything outside it is skipped, never deleted), and the response reports exactly what was deleted, not found, skipped, or errored.

---

### 📣 **Social Post Generator**

Available under **Content Management → Social Post**:

- **Generate Post** – generates a social media ready image to share.
- **Set template** – upload a template for your social posts (1440x2160)

---

## ⚠️ **Critical Notes**

- **Dev server runs on port 4000**, not the Next.js default 3000.
- **Packages/Roles**: Each has its own independent library file under `app/db/libraries/` — granting a library to one role has no effect on the others. Roles themselves live in `app/db/roles.json`, managed from **User Management → Roles**.
- **Ratings**: The list offered on the Rate Content page lives in `app/db/ratings.json`, managed from **Parental Ratings → Manage Ratings**. Deleting a rating doesn't change items already tagged with it in Jellyfin.
- **Delete Playlist Songs is destructive and irreversible** — it deletes real files from disk. The folder-path safety guard only stops it from deleting _outside_ the folder you picked; it won't stop you from picking the wrong folder.
- **First-run delays**: media/photo updates may take time (later calls are faster, since processed IDs are skipped).

---

## 🔮 **Planned Features**

- **Sync Crew & Cast**: Feature to sync crew and cast member pictures.
- **Homepage Library order**: Re-order the libraries for all users.
- **Suggest a feature!** (Open an issue or DM me.)

---

## 💡 **Good to Know**

- **No database required** – All data is stored as files in the project folder (`app/db/`).
- **Works alongside Jellyfin** – No conflicts with your existing setup; Jellydash just talks to Jellyfin's API.

---

**🌟 Love Jellydash?** Star the repo and help it grow!
