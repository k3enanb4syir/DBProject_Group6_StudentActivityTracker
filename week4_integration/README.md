# Student Activity Tracker

A web application for tracking student activities. Built with Node.js, SQLite, and Vite.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your computer:
* [Node.js](https://nodejs.org/) (Version 14 or higher)
* [Git](https://git-scm.com/)

## 🚀 Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/[YOUR-REPO-NAME].git
    cd my-student-tracker
    ```

2.  **Install Dependencies**
    Run this command to download all the libraries required (the node_modules):
    ```bash
    npm install
    ```

## 🗄️ Database Setup

Since the local database file is not uploaded to GitHub, you need to initialize it:

1.  Ensure you have the `StudentActivityTracker.sql` file (it is included in this repo).
2.  **Option A (If you have a customized script):** Run your database initialization script if you have one.
3.  **Option B (Manual):**
    * Open `StudentActivityTracker.sql` using an SQLite viewer (like *DB Browser for SQLite*) or a VS Code extension.
    * Run the SQL commands to generate the `student_tracker.db` file in the root directory.

## 🏃‍♂️ How to Run

You likely need to run both the backend server and the frontend.

**1. Start the Backend Server**
Open a terminal and run:
```bash
node server.js