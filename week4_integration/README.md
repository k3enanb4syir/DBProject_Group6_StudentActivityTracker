# Student Activity Tracker

A web application for tracking student activities. Built with Node.js, SQLite, React, and Vite.

## Prerequisites

Before you begin, make sure you have [Node.js](https://nodejs.org/) installed on your computer.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/[YOUR-REPO-NAME].git
    cd my-student-tracker
    ```

2.  **Install Dependencies**
    Run the following commands to install the necessary libraries, including the icon pack:
    ```bash
    npm install
    npm install react-icons
    ```

3.  **Database Setup**
    The database file (`student_tracker.db`) is not included in the download. You need to create it:
    * Open the file `StudentActivityTracker.sql` in this folder.
    * Run the SQL commands inside it (using an SQLite extension in VS Code or "DB Browser for SQLite") to generate your local database.

## How to Run

You need to run the backend and frontend in **two separate terminal windows**.

**Step 1: Start the Backend Server**
Open a terminal inside the project folder and run:
```bash
node server.js
```
