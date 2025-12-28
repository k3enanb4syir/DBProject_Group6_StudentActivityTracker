import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Setup for static file serving (ES Modules workaround for __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDriver = sqlite3.verbose();

app.use(cors());
app.use(express.json());

// --- FILE UPLOAD CONFIGURATION ---
// 1. Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Serve uploaded files statically so Admins can view them
// Access via: http://localhost:3000/uploads/filename.pdf
app.use('/uploads', express.static(uploadDir));

// 3. Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Unique filename: Timestamp + Random + Original Extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


// 1. Connect to Database
const db = new dbDriver.Database('./student_tracker.db', (err) => {
    if (err) console.error("Database error:", err.message);
    else console.log("Connected to the SQLite database.");
});

// 2. Initialize Database from SQL File
const initDatabase = () => {
    return new Promise((resolve, reject) => {
        try {
            const dataSql = fs.readFileSync('./StudentActivityTracker.sql', 'utf8');
            db.exec(dataSql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log("Database initialized from SQL file.");
                    
                    // AUTO-MIGRATION: Add Proof_File column if it doesn't exist
                    // This creates the column automatically without deleting your DB
                    db.run("ALTER TABLE Participation_Record ADD COLUMN Proof_File VARCHAR(255)", (err) => {
                        // Ignore error if column already exists
                        resolve();
                    });
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
    
    const sqlStudent = "SELECT * FROM Students WHERE Email = ? AND Password = ?";
    db.get(sqlStudent, [email, password], (err, student) => {
        if (err) return res.status(500).json({ error: err.message });
        if (student) return res.json({ role: 'student', data: student });
        
        const sqlFaculty = "SELECT * FROM Faculty WHERE Email = ? AND Password = ?";
        db.get(sqlFaculty, [email, password], (err, faculty) => {
            if (err) return res.status(500).json({ error: err.message });
            if (faculty) return res.json({ role: 'faculty', data: faculty });
            return res.status(401).json({ error: "Invalid credentials" });
        });
    });
});

// Get Activities
app.get('/api/activities', (req, res) => {
    const sql = `
        SELECT A.*, F.Faculty_Name AS Advisor_Name, S.Full_Name AS President_Name
        FROM Activity A
        LEFT JOIN Faculty F ON A.Advisor_Faculty_ID = F.Faculty_ID
        LEFT JOIN Students S ON A.President_NIM = S.NIM
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get Records
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

// Submit Record (UPDATED: Handle Multipart Form Data)
// 'upload.single('file')' extracts the file from the request
app.post('/api/records', upload.single('file'), (req, res) => {
    // req.file contains the uploaded file info
    // req.body contains the text fields
    const { nim, activity_id, role, date, hours } = req.body;
    const proofFile = req.file ? req.file.filename : null;

    if (!nim || !activity_id || !date || !hours) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        INSERT INTO Participation_Record 
        (NIM, Activity_ID, Role, Date_Of_Activity, Submission_Date, Hours_Submitted, Status, Proof_File) 
        VALUES (?, ?, ?, ?, DATE('now'), ?, 'Pending', ?)
    `;

    db.run(sql, [nim, activity_id, role, date, hours, proofFile], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Record submitted successfully", id: this.lastID });
    });
});

// --- ADMIN ROUTES ---

// Get Pending Requests
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

// Review Request
app.post('/api/admin/review', (req, res) => {
    const { record_id, status, faculty_id } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const sql = "UPDATE Participation_Record SET Status = ?, Approver_Faculty_ID = ? WHERE Record_ID = ?";
    db.run(sql, [status, faculty_id, record_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: `Record ${status} successfully` });
    });
});

// Start Server
initDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("CRITICAL ERROR: Could not initialize database.", err);
});