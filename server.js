const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// JSON file storage
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DB_FILE = path.join(DATA_DIR, "bookings.json");

function readDB() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, "utf8")); }
  catch { return { nextId: 1, bookings: [] }; }
}
function writeDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Get bookings for a date range
app.get("/api/bookings", (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: "start and end required" });
  const db = readDB();
  const filtered = db.bookings.filter(b => b.date >= start && b.date <= end);
  filtered.sort((a, b) => a.date.localeCompare(b.date) || a.start_hour - b.start_hour);
  res.json(filtered);
});

// Create
app.post("/api/bookings", (req, res) => {
  const { date, name, email, phone, start_hour, hours, status, notes } = req.body;
  if (!date || !name || start_hour == null) return res.status(400).json({ error: "date, name, start_hour required" });

  const db = readDB();
  const dur = hours || 1;

  // Conflict check
  const conflicts = db.bookings.filter(b =>
    b.date === date && b.status !== "cancelled" &&
    b.start_hour < start_hour + dur && b.start_hour + b.hours > start_hour
  );
  if (conflicts.length) return res.status(409).json({ error: "Time slot conflict", conflicts });

  const booking = {
    id: db.nextId++, date, name, email: email || "", phone: phone || "",
    start_hour, hours: dur, status: status || "confirmed", notes: notes || "",
    created_at: new Date().toISOString()
  };
  db.bookings.push(booking);
  writeDB(db);
  res.status(201).json(booking);
});

// Update
app.put("/api/bookings/:id", (req, res) => {
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  const existing = db.bookings[idx];
  const updated = { ...existing, ...req.body, id: existing.id, date: existing.date, start_hour: existing.start_hour };
  db.bookings[idx] = updated;
  writeDB(db);
  res.json(updated);
});

// Delete
app.delete("/api/bookings/:id", (req, res) => {
  const db = readDB();
  const idx = db.bookings.findIndex(b => b.id === +req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.bookings.splice(idx, 1);
  writeDB(db);
  res.json({ deleted: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Studio Bookings running on port ${PORT}`));
