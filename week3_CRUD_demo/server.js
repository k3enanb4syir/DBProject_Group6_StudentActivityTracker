// 1. Import all our required packages
const express = require('express');
const cors = require('cors'); // Middleware to allow frontend to talk to backend
const db = require('./database.js'); // Import our database connection

// 2. Create the Express app and set the port
const app = express();
const PORT = 3001; // Using 3001

// 3. Use middleware
app.use(cors()); // Allows our HTML file to make requests
app.use(express.json()); // Allows the server to read JSON from request bodies

// 4. DEFINE ALL OUR API ENDPOINTS (THE CRUD ROUTES)

// --- Test Route ---
app.get('/api', (req, res) => {
    res.json({ message: "Hello from the Student Tracker API!" });
});

// === CRUD Operations for Students ===

// --- CREATE (POST) ---
app.post('/api/students', (req, res) => {
    const { nim, full_name, email, major, dpa_faculty_id } = req.body;
    if (!nim || !full_name || !email) {
        return res.status(400).json({ "success": false, "message": "NIM, Full Name, and Email are required." });
    }
    const sql = 'INSERT INTO Students (NIM, Full_Name, Email, Major, DPA_Faculty_ID) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [nim, full_name, email, major, dpa_faculty_id], function(err) {
        if (err) {
            return res.status(400).json({ "success": false, "message": err.message });
        }
        res.status(201).json({ "success": true, "message": "Student created successfully.", "nim": nim });
    });
});

// --- READ (GET All) ---
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM Students';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ "success": false, "message": err.message });
        }
        res.json(rows);
    });
});

// --- READ (GET One by NIM) ---
app.get('/api/students/:nim', (req, res) => {
    const nim = req.params.nim;
    const sql = 'SELECT * FROM Students WHERE NIM = ?';
    db.get(sql, [nim], (err, row) => {
        if (err) {
            return res.status(400).json({ "success": false, "message": err.message });
        }
        if (!row) {
            return res.status(404).json({ "success": false, "message": "Student not found." });
        }
        res.json(row);
    });
});

// --- UPDATE (PUT) ---
app.put('/api/students/:nim', (req, res) => {
    const { full_name, email, major, dpa_faculty_id } = req.body;
    const nim = req.params.nim;
    const sql = 'UPDATE Students SET Full_Name = ?, Email = ?, Major = ?, DPA_Faculty_ID = ? WHERE NIM = ?';
    db.run(sql, [full_name, email, major, dpa_faculty_id, nim], function(err) {
        if (err) {
            return res.status(400).json({ "success": false, "message": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ "success": false, "message": "Student not found." });
        }
        res.json({ "success": true, "message": "Student updated successfully." });
    });
});

// --- DELETE (DELETE) ---
app.delete('/api/students/:nim', (req, res) => {
    const nim = req.params.nim;
    const sql = 'DELETE FROM Students WHERE NIM = ?';
    db.run(sql, [nim], function(err) {
        if (err) {
            return res.status(400).json({ "success": false, "message": err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ "success": false, "message": "Student not found." });
        }
        res.json({ "success": true, "message": "Student deleted successfully." });
    });
});

// === Read-Only Routes for Other Tables ===

app.get('/api/faculty', (req, res) => {
    const sql = 'SELECT * FROM Faculty';
    db.all(sql, [], (err, rows) => {
        if (err) { return res.status(400).json({ "success": false, "message": err.message }); }
        res.json(rows);
    });
});

app.get('/api/activities', (req, res) => {
    const sql = 'SELECT * FROM Activity';
    db.all(sql, [], (err, rows) => {
        if (err) { return res.status(400).json({ "success": false, "message": err.message }); }
        res.json(rows);
    });
});


// 5. START THE SERVER
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("You can now open 'index.html' in your browser.");
});
