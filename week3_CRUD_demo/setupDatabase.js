// This is a utility script to be run ONCE.
// Its only job is to read the schema from 'StudentActivityTracker.sql'
// and create the 'tracker.db' file, populating it with all the tables.

// 1. Import the required Node.js modules
const fs = require('fs'); // 'fs' is the File System module, for reading files
const sqlite3 = require('sqlite3').verbose(); // '.verbose()' gives detailed error messages

// 2. Define the names of our database file and our schema file
const DB_SOURCE = "tracker.db";
const SCHEMA_SOURCE = "StudentActivityTracker.sql"; // The file you uploaded

// 3. This function checks if the database file already exists.
fs.access(DB_SOURCE, fs.constants.F_OK, (err) => {
    if (err) {
        // The file does NOT exist, so let's create it.
        console.log(`Database '${DB_SOURCE}' not found. Creating it...`);
        createDatabase();
    } else {
        // The file DOES exist.
        console.log(`Database '${DB_SOURCE}' already exists. Setup is not needed.`);
    }
});

/**
 * This is the main function that creates and sets up the database.
 */
function createDatabase() {
    // 4. Create a new database connection.
    // This command creates the 'tracker.db' file.
    const db = new sqlite3.Database(DB_SOURCE, (err) => {
        if (err) {
            // Cannot open/create database
            console.error(err.message);
            throw err;
        } else {
            console.log('Connected to the SQLite database.');
            
            try {
                // 5. Read the SQL schema file.
                console.log(`Reading schema from ${SCHEMA_SOURCE}...`);
                // This reads your entire SQL file into a string.
                const sqlScript = fs.readFileSync(SCHEMA_SOURCE, 'utf8');
                
                // 6. Execute the entire SQL script
                db.exec(sqlScript, (err) => {
                    if (err) {
                        console.error("Error creating tables:", err.message);
                    } else {
                        console.log("Tables created successfully.");
                        console.log(`Database '${DB_SOURCE}' is now ready.`);
                    }
                    
                    // 7. Close the database connection.
                    db.close((err) => {
                        if (err) {
                            console.error(err.message);
                        }
                        console.log('Database setup complete. Connection closed.');
                    });
                });
            } catch (fsErr) {
                // This catches errors if 'StudentActivityTracker.sql' is missing
                console.error(`Could not read schema file: ${SCHEMA_SOURCE}`, fsErr.message);
                db.close();
            }
        }
    });
}
