CREATE TABLE Faculty (
    Faculty_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Faculty_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(20)
);

CREATE TABLE Students (
    NIM INTEGER PRIMARY KEY,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Major VARCHAR(50),
    DPA_Faculty_ID INTEGER,
    FOREIGN KEY (DPA_Faculty_ID) REFERENCES Faculty(Faculty_ID)
);


CREATE TABLE Activity (
    Activity_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Activity_Name VARCHAR(100) NOT NULL,
    Activity_Type VARCHAR(50),
    Activity_Credits INTEGER DEFAULT 0,
    Description TEXT,
    Advisor_Faculty_ID INTEGER,
    President_NIM INTEGER,
    FOREIGN KEY (Advisor_Faculty_ID) REFERENCES Faculty(Faculty_ID),
    FOREIGN KEY (President_NIM) REFERENCES Students(NIM)
);

CREATE TABLE Participation_Record (
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