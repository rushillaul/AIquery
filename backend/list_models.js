require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    try {
        // We'll use fetch directly since getGenerativeModel doesn't have a list method in some SDKs
        const key = process.env.GEMINI_API_KEY;
        if (!key || key === "your_google_ai_studio_token_here") {
            console.log("No valid API key found in .env");
            return;
        }
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log(data);
        }
    } catch (e) {
        console.error("Error fetching models:", e);
    }
}
listModels();
