const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "", // 👉 put your MySQL password
    database: "mednexus"
});

// Connect DB
db.connect(err => {
    if (err) {
        console.log("❌ DB connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL");
    }
});

// API route
app.get("/search", (req, res) => {
    const name = req.query.name;

    const sql = "SELECT * FROM hospitals WHERE name LIKE ?";
    db.query(sql, [`%${name}%`], (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(result);
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("🚀 Server running on http://localhost:3000");
});