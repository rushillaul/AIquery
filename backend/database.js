const { createPool } = require('@vercel/postgres');

const pool = createPool({
    connectionString: process.env.POSTGRES_URL
});

async function seedDatabase() {
    try {
        const client = await pool.connect();
        
        console.log("Setting up Postgres schema...");
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255),
                email VARCHAR(255),
                role VARCHAR(255),
                salary INTEGER
            );
        `);
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                amount DECIMAL(10, 2),
                status VARCHAR(255)
            );
        `);

        const { rows } = await client.query("SELECT count(*) as count FROM users");
        if (rows[0].count == 0) {
            console.log("Seeding mock Postgres database...");
            await client.query(`
                INSERT INTO users (name, email, role, salary) VALUES 
                ('Alice Smith', 'alice@example.com', 'Admin', 120000),
                ('Bob Jones', 'bob@example.com', 'User', 75000),
                ('Charlie Brown', 'charlie@example.com', 'User', 82000);
            `);
            
            await client.query(`
                INSERT INTO orders (user_id, amount, status) VALUES 
                (1, 250.50, 'Shipped'),
                (2, 89.99, 'Processing'),
                (3, 10.00, 'Delivered');
            `);
            console.log("Mock Postgres DB seeded successfully.");
        }
        
        client.release();
    } catch (err) {
        console.error("Postgres seeding failed. Check your POSTGRES_URL environment variable:", err.message);
    }
}

// Only attempt to seed if we have a URL provided
if (process.env.POSTGRES_URL) {
    seedDatabase();
}

module.exports = async function query(sqlString, params = []) {
    if (!process.env.POSTGRES_URL) {
        throw new Error("Missing POSTGRES_URL environment variable.");
    }
    
    const client = await pool.connect();
    try {
        const result = await client.query(sqlString, params);
        return result.rows;
    } finally {
        client.release();
    }
};const sqlite3 = require('sqlite3').verbose();

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
