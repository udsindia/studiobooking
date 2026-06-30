# Studio Bookings

A simple web app to manage hourly bookings for a podcast studio.

## Features

- Week and day calendar views
- Create, edit, delete bookings
- Conflict detection (prevents double-booking)
- Status tracking (confirmed / pending / cancelled)
- Client details: name, email, phone, notes

## Run locally

```bash
npm install
npm start
```

Open http://localhost:3000

## Deploy to Railway

1. Push this folder to a **GitHub repo**
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. Railway auto-detects Node.js — no config needed
4. Add a **Volume** (important for persistent data):
   - Go to your service → **Settings** → **Volumes**
   - Mount path: `/data`
   - Add environment variable: `DATA_DIR=/data`
5. Deploy — Railway gives you a public URL to share

### Why the volume matters

Bookings are stored in a JSON file. Without a volume, Railway's ephemeral filesystem wipes data on every deploy. The volume keeps your bookings safe.

## Environment variables

| Variable   | Default   | Description                     |
|------------|-----------|---------------------------------|
| `PORT`     | `3000`    | Server port (Railway sets this) |
| `DATA_DIR` | `.`       | Where to store bookings.json    |
