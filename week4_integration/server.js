// ============================================================================
// WEEK 4 SERVER - COMPLETE BACKEND
// Includes: Students CRUD, Faculty/Activity Read, and NEW Participation Logic
// ============================================================================

const express = require('express');
const cors = require('cors');
const db = require('./database.js'); // Uses your existing database connection

const app = express();
const PORT = 3001; // We continue using port 3001

// Middleware
app.use(cors());
app.use(express.json());

// --- Test Route ---
app.get('/api', (req, res) => {
    res.json({ message: "Student Activity Tracker API is running!" });
});

// ============================================================================
// 1. STUDENTS (Week 3 Code - Kept the same)
// ============================================================================

// CREATE Student
app.post('/api/students', (req, res) => {
    const { nim, full_name, email, major, dpa_faculty_id } = req.body;
    const sql = 'INSERT INTO Students (NIM, Full_Name, Email, Major, DPA_Faculty_ID) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [nim, full_name, email, major, dpa_faculty_id], function(err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.status(201).json({ success: true, message: "Student created.", nim: nim });
    });
});

// READ All Students
app.get('/api/students', (req, res) => {
    const sql = 'SELECT * FROM Students';
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json(rows);
    });
});

// READ One Student
app.get('/api/students/:nim', (req, res) => {
    const sql = 'SELECT * FROM Students WHERE NIM = ?';
    db.get(sql, [req.params.nim], (err, row) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json(row || {});
    });
});

// UPDATE Student
app.put('/api/students/:nim', (req, res) => {
    const { full_name, email, major, dpa_faculty_id } = req.body;
    const sql = 'UPDATE Students SET Full_Name = ?, Email = ?, Major = ?, DPA_Faculty_ID = ? WHERE NIM = ?';
    db.run(sql, [full_name, email, major, dpa_faculty_id, req.params.nim], function(err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json({ success: true, message: "Student updated." });
    });
});

// DELETE Student
app.delete('/api/students/:nim', (req, res) => {
    const sql = 'DELETE FROM Students WHERE NIM = ?';
    db.run(sql, [req.params.nim], function(err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json({ success: true, message: "Student deleted." });
    });
});

// ============================================================================
// 2. HELPER TABLES (Week 3 Code - Kept the same)
// ============================================================================

// READ Faculty (For dropdowns)
app.get('/api/faculty', (req, res) => {
    db.all('SELECT * FROM Faculty', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// READ Activities (For dropdowns)
app.get('/api/activities', (req, res) => {
    db.all('SELECT * FROM Activity', [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json(rows);
    });
});

// ============================================================================
// 3. PARTICIPATION RECORDS (NEW FOR WEEK 4!)
// ============================================================================

// --- GET ALL RECORDS (For Admin Dashboard) ---
// We join tables here so the admin sees Names ("John Doe") instead of just IDs ("1001")
app.get('/api/records', (req, res) => {
    const sql = `
        SELECT 
            pr.Record_ID,
            pr.NIM,
            s.Full_Name AS Student_Name,
            pr.Activity_ID,
            a.Activity_Name,
            pr.Role,
            pr.Status,
            pr.Hours_Submitted,
            pr.Submission_Date
        FROM Participation_Record pr
        JOIN Students s ON pr.NIM = s.NIM
        JOIN Activity a ON pr.Activity_ID = a.Activity_ID
        ORDER BY pr.Submission_Date DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json(rows);
    });
});

// --- GET STUDENT HISTORY (For Student Report) ---
// This filters records for only ONE specific student
app.get('/api/students/:nim/records', (req, res) => {
    const sql = `
        SELECT 
            pr.Record_ID,
            a.Activity_Name,
            pr.Role,
            pr.Status,
            pr.Hours_Submitted,
            pr.Date_Of_Activity
        FROM Participation_Record pr
        JOIN Activity a ON pr.Activity_ID = a.Activity_ID
        WHERE pr.NIM = ?
        ORDER BY pr.Date_Of_Activity DESC
    `;
    db.all(sql, [req.params.nim], (err, rows) => {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json(rows);
    });
});

// --- SUBMIT NEW RECORD (Student "Join Activity") ---
app.post('/api/records', (req, res) => {
    const { nim, activity_id, role, hours, date } = req.body;
    
    // Automatically set today's date as submission date
    const submission_date = new Date().toISOString().split('T')[0];

    const sql = `
        INSERT INTO Participation_Record 
        (NIM, Activity_ID, Role, Status, Date_Of_Activity, Submission_Date, Hours_Submitted) 
        VALUES (?, ?, ?, 'Pending', ?, ?, ?)
    `;

    db.run(sql, [nim, activity_id, role, date, submission_date, hours], function(err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.status(201).json({ success: true, message: "Activity submitted successfully!" });
    });
});

// --- APPROVE/REJECT RECORD (Admin Action) ---
app.put('/api/records/:id/status', (req, res) => {
    const { status, approver_id } = req.body; // e.g., "Approved", 1 (Faculty ID)
    const record_id = req.params.id;

    const sql = `
        UPDATE Participation_Record 
        SET Status = ?, Approver_Faculty_ID = ? 
        WHERE Record_ID = ?
    `;

    db.run(sql, [status, approver_id, record_id], function(err) {
        if (err) return res.status(400).json({ success: false, message: err.message });
        res.json({ success: true, message: `Record marked as ${status}.` });
    });
});

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
    console.log(`Week 4 Server is running on http://localhost:${PORT}`);
});
