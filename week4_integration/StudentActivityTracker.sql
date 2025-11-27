PRAGMA foreign_keys = ON;

-- 1. Faculty Table
CREATE TABLE IF NOT EXISTS Faculty (
    Faculty_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Faculty_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(20),
    Password VARCHAR(100) DEFAULT 'admin123'
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS Students (
    NIM INTEGER PRIMARY KEY,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Major VARCHAR(50),
    DPA_Faculty_ID INTEGER,
    Password VARCHAR(100) DEFAULT 'password123',
    FOREIGN KEY (DPA_Faculty_ID) REFERENCES Faculty(Faculty_ID)
);

-- 3. Activity Table (UPDATED: Added UNIQUE constraint)
CREATE TABLE IF NOT EXISTS Activity (
    Activity_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Activity_Name VARCHAR(100) NOT NULL UNIQUE, -- <--- THIS FIXES THE DUPLICATES
    Activity_Type VARCHAR(50),
    Activity_Credits INTEGER DEFAULT 0,
    Description TEXT,
    Advisor_Faculty_ID INTEGER,
    President_NIM INTEGER,
    FOREIGN KEY (Advisor_Faculty_ID) REFERENCES Faculty(Faculty_ID),
    FOREIGN KEY (President_NIM) REFERENCES Students(NIM)
);

-- 4. Participation Record Table
CREATE TABLE IF NOT EXISTS Participation_Record (
    Record_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    NIM INTEGER NOT NULL,
    Activity_ID INTEGER NOT NULL,
    Role VARCHAR(100),
    Status VARCHAR(20) NOT NULL DEFAULT 'Pending', 
    Date_Of_Activity DATE,
    Submission_Date DATE NOT NULL,
    Hours_Submitted INTEGER,
    Approver_Faculty_ID INTEGER,
    FOREIGN KEY (NIM) REFERENCES Students(NIM) ON DELETE CASCADE,
    FOREIGN KEY (Activity_ID) REFERENCES Activity(Activity_ID) ON DELETE CASCADE,
    FOREIGN KEY (Approver_Faculty_ID) REFERENCES Faculty(Faculty_ID)
);

-- --- SEED DATA ---

INSERT OR IGNORE INTO Faculty (Faculty_Name, Email, Phone_Number) VALUES 
('Dr. Alice Johnson', 'alice@university.edu', '555-0101'),
('Prof. Bob Smith', 'bob@university.edu', '555-0102'),
('Dr. Carol White', 'carol@university.edu', '555-0103');

INSERT OR IGNORE INTO Students (NIM, Full_Name, Email, Major, Password) VALUES 
(24536808, 'Muhammad Keenan Basyir', 'keenan@university.edu', 'Computer Science', 'password123'),
(24532920, 'Marvel Maliq Prabawa', 'marvel@university.edu', 'Information Systems', 'password123'),
(24546698, 'Fayyadh Dhia Abyan', 'fayyadh@university.edu', 'Computer Engineering', 'password123');

INSERT OR IGNORE INTO Activity (Activity_Name, Activity_Type, Activity_Credits, Description) VALUES 
('Badminton Club', 'Sports', 3, 'Weekly badminton practice.'),
('Robotics Workshop', 'Academic', 5, 'Building autonomous robots.'),
('Charity Run Volunteer', 'Volunteer', 2, 'Helping organize the run.'),
('Photography Club', 'Arts', 3, 'Visual storytelling workshop.');