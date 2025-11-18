// 1. Import the 'sqlite3' package.
const sqlite3 = require('sqlite3').verbose();

// 2. Define the name of our database file.
const DB_SOURCE = "tracker.db";

// 3. Create and connect to the database.
// This code "unlocks" and connects to the existing database file.
const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the existing SQLite database: tracker.db');
        
        // 4. IMPORTANT: Turn on Foreign Key support.
        // This must be done every time we connect to enforce our rules.
        db.exec("PRAGMA foreign_keys = ON;", (err) => {
            if (err) {
                console.error("Could not enable foreign keys:", err.message);
            } else {
                console.log("Foreign key enforcement is on.");
            }
        });
    }
});

// 5. Export the 'db' object so 'server.js' can import and use it.
module.exports = db;
