# **Student Activity Tracker**

**Group 6 Database project**

## 1. Project Overview
This repository contains the 5-week project of our Database project with the chosen topic, **Student Acitivity Tracker**, a system designed to manage and approve students' extracurricular activity records (eg: sports, clubs, volunteer work) in a centralized and efficient way. The goal is to design, develop, and document a complete database-driven application from the ground up.

## 2. Group Members
- Muhammad Keenan Basyir
- Fayyadh Dhia Abyan
- Marvel Maliq Prabawa

## 3. Project Objectives
- To create a system for administrators to manage all available extracurricular activities.
- To allow users/students to subtmit their partcipation records (roles, hours, etc) for approval.
- To implement an approval workflow for faculty or admins to verify these records.
- To build a reporting feature for students to generate a consolidated list of their approvded activities.
- The end product/application must support all Create, Read, Update and Delete operations and be built on a database.

## 4. Weekly Deliverables & Folder Structure
**Week 1: Project & ER Diagram**
- **Folder**: week1_proposal_ERD/
- **Contains**: The initial project proposal document and the conceptual Entity-Relationship Diagram (ERD).

**Week 2: Logical Scheme & SQL Implementation**
- **Folder**: week2_schema SQL/
- **Contains**: The logical relational schema and the .sql script with all CREATE TABLE commands.
  
**Week 3: Basic CRUD Operations**
- **Folder**: week3_CRUD_demo/
- **Contains**: The initial application source code demostrating all the operations of CRUD
  
**Week 4: Application Integration & Interface**
  - **Folder**: week4_integration/
  - **Contains**: The complete application source code, with the database fully connected to the frontend user interface and the search/report feature implemented.
    
**Week 5: Final Report & Presentation**
- **Folder**: week5_final_report/
- **Contains**: The final project docummentation

# **Week 3: Basic CRUD Operations Demo**

## How to Run This Prototype/Demo

You will need two terminals open.

### Terminal 1: Run the Backend Server
1.  Navigate to this `week3_CRUD_demo/` folder.
2.  Install the required Node.js packages:
    ```bash
    npm install
    ```
3.  **One-Time Setup:** Create the database by running the setup script (this reads your `.sql` file):
    ```bash
    node setupDatabase.js
    ```
    *(You only need to do this once. A `tracker.db` file will appear.)*

4.  Start the backend API server:
    ```bash
    node server.js
    ```
    *(The server will now be running on `http://localhost:3001`)*

### Terminal 2: View the Frontend
1.  Simply open the `index.html` file in your web browser.
2.  You can now use the form to Create, Read, Update, and Delete students. The data will be saved in the `tracker.db` file.
