const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    role TEXT,
    base_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY,
    base_id INTEGER,
    asset_id INTEGER,
    quantity INTEGER,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY,
    from_base INTEGER,
    to_base INTEGER,
    asset_id INTEGER,
    quantity INTEGER,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY,
    base_id INTEGER,
    asset_id INTEGER,
    quantity INTEGER,
    assigned_to TEXT,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS expenditures (
    id INTEGER PRIMARY KEY,
    base_id INTEGER,
    asset_id INTEGER,
    quantity INTEGER,
    date TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY,
    action TEXT,
    details TEXT,
    timestamp TEXT
  )`);
});

module.exports = db;