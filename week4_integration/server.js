import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import fs from 'fs';

const app = express();
const PORT = 3000;

const dbDriver = sqlite3.verbose();

app.use(cors());
app.use(express.json());

// 1. Connect to Database
const db = new dbDriver.Database('./student_tracker.db', (err) => {
    if (err) console.error("Database error:", err.message);
    else console.log("Connected to the SQLite database.");
});

// 2. Initialize Database from SQL File (Returns Promise)
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            // Read the SQL file from the root directory
            const dataSql = fs.readFileSync('./StudentActivityTracker.sql', 'utf8');
            
            // Execute the SQL script
            db.exec(dataSql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Database initialized from SQL file.");
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
};

// --- API ROUTES ---

// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    // Check Students Table First
    const sqlStudent = "SELECT * FROM Students WHERE Email = ? AND Password = ?";
    db.get(sqlStudent, [email, password], (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (student) {
            return res.json({ role: 'student', data: student });
        } else {
            // Check Faculty Table
            const sqlFaculty = "SELECT * FROM Faculty WHERE Email = ? AND Password = ?";
            db.get(sqlFaculty, [email, password], (err, faculty) => {
                if (err) return res.status(500).json({ error: err.message });
                if (faculty) {
                    return res.json({ role: 'faculty', data: faculty });
                } else {
                    return res.status(401).json({ error: "Invalid credentials" });
                }
            });
        }
    });
});

// Get Activities (For Student Dashboard & Dropdown)
app.get('/api/activities', (req, res) => {
    db.all("SELECT * FROM Activity", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Specific Student Records (For Student History)
app.get('/api/records', (req, res) => {
    const { nim } = req.query; 
    const sql = `
        SELECT P.*, A.Activity_Name, A.Activity_Type, A.Activity_Credits 
        FROM Participation_Record P 
        JOIN Activity A ON P.Activity_ID = A.Activity_ID 
        WHERE P.NIM = ?
    `;
    db.all(sql, [nim], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Submit New Record (Student Action)
app.post('/api/records', (req, res) => {
    const { nim, activity_id, role, date, hours } = req.body;

    if (!nim || !activity_id || !date || !hours) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        INSERT INTO Participation_Record 
        (NIM, Activity_ID, Role, Date_Of_Activity, Submission_Date, Hours_Submitted, Status) 
        VALUES (?, ?, ?, ?, DATE('now'), ?, 'Pending')
    `;

    db.run(sql, [nim, activity_id, role, date, hours], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Record submitted successfully", id: this.lastID });
    });
});

// --- ADMIN ROUTES ---

// 1. Get All Pending Requests (For Admin Dashboard)
app.get('/api/admin/pending', (req, res) => {
    const sql = `
        SELECT P.*, S.Full_Name as Student_Name, A.Activity_Name, A.Activity_Type
        FROM Participation_Record P
        JOIN Students S ON P.NIM = S.NIM
        JOIN Activity A ON P.Activity_ID = A.Activity_ID
        WHERE P.Status = 'Pending'
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. Approve or Reject a Request (Admin Action)
app.post('/api/admin/review', (req, res) => {
    const { record_id, status, faculty_id } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const sql = `
        UPDATE Participation_Record 
        SET Status = ?, Approver_Faculty_ID = ? 
        WHERE Record_ID = ?
    `;

    db.run(sql, [status, faculty_id, record_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Record ${status} successfully` });
    });
});

// --- STARTUP LOGIC ---
// Only start server AFTER DB is ready to prevent "no such table" errors
initDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("CRITICAL ERROR: Could not initialize database.");
        console.error("Make sure 'StudentActivityTracker.sql' is in the root folder.");
        console.error(err);
    });