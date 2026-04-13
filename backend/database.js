const sqlite3 = require('sqlite3').verbose();

// In Vercel serverless functions, the file system is read-only except for /tmp/
const dbPath = process.env.NODE_ENV === 'production' ? '/tmp/database.sqlite' : './database.sqlite';

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.serialize(() => {
            // Setup mock tables
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT,
                role TEXT,
                salary INTEGER
            )`);
            
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                amount REAL,
                status TEXT
            )`);

            // Seed data if empty
            db.get("SELECT count(*) as count FROM users", (err, row) => {
                if (row && row.count === 0) {
                    const insertUser = db.prepare(`INSERT INTO users (name, email, role, salary) VALUES (?, ?, ?, ?)`);
                    insertUser.run("Alice Smith", "alice@example.com", "Admin", 120000);
                    insertUser.run("Bob Jones", "bob@example.com", "User", 75000);
                    insertUser.run("Charlie Brown", "charlie@example.com", "User", 82000);
                    insertUser.finalize();
                    
                    const insertOrder = db.prepare(`INSERT INTO orders (user_id, amount, status) VALUES (?, ?, ?)`);
                    insertOrder.run(1, 250.50, "Shipped");
                    insertOrder.run(2, 89.99, "Processing");
                    insertOrder.run(3, 10.00, "Delivered");
                    insertOrder.finalize();
                    console.log("Mock database seeded successfully.");
                }
            });
        });
    }
});

module.exports = function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};
