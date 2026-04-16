const express = require("express");
const cors = require("cors");
const db = require("./db");
const rbac = require("./middleware/rbac");

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'https://vercel.app', // Your actual Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

/* ================= FAKE AUTH ================= */
app.use((req, res, next) => {
  const role = req.headers["role"] || "admin";

  req.user = {
    id: 1,
    role: role,
    base_id: 1,
  };

  next();
});

/* ================= LOG FUNCTION ================= */
function log(action, details) {
  db.run(
    `INSERT INTO logs (action, details, timestamp) VALUES (?, ?, ?)`,
    [action, JSON.stringify(details), new Date().toISOString()]
  );
}

/* ================= PURCHASE ================= */
app.post("/purchase", rbac(["admin", "logistics"]), (req, res) => {
  const { base_id, asset_id, quantity } = req.body;

  db.run(
    `INSERT INTO purchases (base_id, asset_id, quantity, date)
     VALUES (?, ?, ?, ?)`,
    [base_id, asset_id, quantity, new Date().toISOString()]
  );

  log("PURCHASE", req.body);
  res.json({ message: "Purchase recorded" });
});

/* ================= TRANSFER ================= */
app.post("/transfer", rbac(["admin", "logistics"]), (req, res) => {
  const { from_base, to_base, asset_id, quantity } = req.body;

  db.run(
    `INSERT INTO transfers (from_base, to_base, asset_id, quantity, date)
     VALUES (?, ?, ?, ?, ?)`,
    [from_base, to_base, asset_id, quantity, new Date().toISOString()]
  );

  log("TRANSFER", req.body);
  res.json({ message: "Transfer successful" });
});

/* ================= ASSIGN ================= */
app.post("/assign", rbac(["admin", "commander"]), (req, res) => {
  const { base_id, asset_id, quantity, assigned_to } = req.body;

  db.run(
    `INSERT INTO assignments (base_id, asset_id, quantity, assigned_to, date)
     VALUES (?, ?, ?, ?, ?)`,
    [base_id, asset_id, quantity, assigned_to, new Date().toISOString()]
  );

  log("ASSIGN", req.body);
  res.json({ message: "Assigned successfully" });
});

/* ================= EXPEND ================= */
app.post("/expend", rbac(["admin", "commander"]), (req, res) => {
  const { base_id, asset_id, quantity } = req.body;

  db.run(
    `INSERT INTO expenditures (base_id, asset_id, quantity, date)
     VALUES (?, ?, ?, ?)`,
    [base_id, asset_id, quantity, new Date().toISOString()]
  );

  log("EXPEND", req.body);
  res.json({ message: "Expended successfully" });
});

/* ================= DASHBOARD ================= */
app.get(
  "/dashboard",
  rbac(["admin", "commander", "logistics"]),
  (req, res) => {
    db.all(`SELECT * FROM purchases`, (e1, purchases) => {
      db.all(`SELECT * FROM transfers`, (e2, transfers) => {
        db.all(`SELECT * FROM assignments`, (e3, assignments) => {
          db.all(`SELECT * FROM expenditures`, (e4, expenditures) => {
            res.json({
              purchases,
              transfers,
              assignments,
              expenditures,
            });
          });
        });
      });
    });
  }
);

/* ================= START ================= */
app.listen(5000, () => console.log("Server running on port 5000"));
