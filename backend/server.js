require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy");

// PHASE 3: AI Service Integration point
async function generateSQLFromText(userText) {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_google_ai_studio_token_here") {
        return { 
           sql: "SELECT * FROM users LIMIT 1", 
           explanation: "You must enter your actual GEMINI_API_KEY into backend/.env for AI logic. Falling back to a dummy query.", 
           isDangerous: false 
        };
    }

    try {
        // Automatically default to the latest available flash model 
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
You are an expert SQL Generator. 
You translate plain English questions into valid SQL queries for a SQLite database.
Here is the schema:
table: users (id INTEGER PRIMARY KEY AUTOMINCREMENT, name TEXT, email TEXT, role TEXT, salary INTEGER)
table: orders (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, amount REAL, status TEXT)

Strict Instructions:
1. Return ONLY pure, valid JSON (no markdown wrapping).
2. The JSON MUST have exactly three keys: "sql", "explanation", "isDangerous".
3. "sql" (string): Executable SQLite code representing the intent. Example: "SELECT * FROM users LIMIT 1".
4. "explanation" (string): Simple, non-technical English explanation of the query.
5. "isDangerous" (boolean): true if it involves DROP, or DELETE/UPDATE without WHERE. Otherwise false.
6. The user query is: "${userText}"
`;
        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();
        
        // Strip markdown backticks if AI hallucinates them despite instructions
        if (text.startsWith('```json')) text = text.substring(7);
        if (text.startsWith('```')) text = text.substring(3);
        if (text.endsWith('```')) text = text.substring(0, text.length - 3);
        text = text.trim();

        const parsed = JSON.parse(text);
        return {
           sql: parsed.sql || "SELECT * FROM users",
           explanation: parsed.explanation || "No explanation provided.",
           isDangerous: Boolean(parsed.isDangerous)
        };
    } catch (e) {
        console.error("AI Generation Error:", e);
        return { 
            sql: "SELECT * FROM users", 
            explanation: `Error communicating with AI parser: ${e.message}. Please check your generated token or network.`, 
            isDangerous: false 
        };
    }
}

app.post('/api/query', async (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: "Text query is required." });
    }

    try {
        // Step 1: Translate English to SQL
        const aiResponse = await generateSQLFromText(text);

        // Step 2: Ensure Safety Constraints
        if (aiResponse.isDangerous) {
            return res.status(403).json({
                error: "DANGEROUS_QUERY_BLOCKED",
                message: "The safety engine flagged this query as destructive.",
                ai_explanation: aiResponse.explanation,
                constructed_sql: aiResponse.sql
            });
        }

        // Step 3: Execute SQL Query Execution
        const database = db.all ? db : (db.default || db);
        database.all(aiResponse.sql, [], (err, rows) => {
            if (err) {
                return res.status(500).json({ 
                    error: "SQL Execution Error", 
                    details: err.message,
                    constructed_sql: aiResponse.sql
                });
            }

            // Step 4: Return Results + Insightful Explanation
            res.json({
                sql: aiResponse.sql,
                explanation: aiResponse.explanation,
                results: rows,
                columns: rows.length > 0 ? Object.keys(rows[0]) : []
            });
        });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message, stack: error.stack });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Backend Server strictly resolving incoming SQL requests running on http://localhost:${PORT}`);
    });
}

module.exports = app;
