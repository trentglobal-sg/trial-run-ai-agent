require('dotenv').config();
const { GoogleGenAI} = require('@google/genai');

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

module.exports = {
    ai,
    MODEL
}