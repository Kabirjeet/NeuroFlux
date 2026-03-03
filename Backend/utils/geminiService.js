// import dotenv from 'dotenv';
// import { GoogleGenAI } from '@google/genai';

// dotenv.config();

// let ai = null;

// /**
//  * Get or initialize AI client
//  * @returns {GoogleGenAI} The AI client
//  */
// const getAI = () => {
//     if (!ai) {
//         const apiKey = process.env.GOOGLE_GENAI_API_KEY;
//         if (!apiKey) {
//             throw new Error('GOOGLE_GENAI_API_KEY not set in environment variables');
//         }
//         ai = new GoogleGenAI({ apiKey });
//     }
//     return ai;
// };

// /**
//  * Generate flashcards from text using Gemini API
//  * @param {string} text - The input text to generate flashcards from
//  * @returns {Promise<Array>} - An array of generated flashcards
//  */

// export const generateFlashcards = async (text) => {
//     try {
//         const aiClient = getAI();
//         const prompt = `Generate 10 flashcards from the following text. Each flashcard should have a question (front) and answer (back). Return the response as a JSON array with objects containing "question" and "answer" fields only.

// Text: ${text.substring(0, 5000)}

// Return ONLY a JSON array, no other text.`;

//         const response = await aiClient.models.generateContent({
//             model: 'gemini-2.0-flash',
//             contents: prompt,
//         });

//         const responseText = response.text;
        
//         // Parse JSON response
//         const jsonMatch = responseText.match(/\[[\s\S]*\]/);
//         if (jsonMatch) {
//             return JSON.parse(jsonMatch[0]);
//         }
        
//         return [];
//     } catch (error) {
//         console.error('Error generating flashcards:', error);
//         throw error;
//     }
// };

// /**
//  * Generate quiz from text using Gemini API
//  * @param {string} text - The input text to generate quiz from
//  * @param {number} numQuestions - Number of questions to generate
//  * @returns {Promise<Array>} - An array of generated quiz questions
//  */

// export const generateQuiz = async (text, numQuestions = 10) => {
//     try {
//         const aiClient = getAI();
//         const prompt = `Generate ${numQuestions} multiple choice quiz questions from the following text. Each question should have:
// - question: the question text
// - options: array of 4 options
// - correctAnswer: the index of the correct answer (0-3)

// Return ONLY a JSON array, no other text.`;

//         const response = await aiClient.models.generateContent({
//             model: 'gemini-2.0-flash',
//             contents: prompt,
//         });

//         const responseText = response.text;
        
//         // Parse JSON response
//         const jsonMatch = responseText.match(/\[[\s\S]*\]/);
//         if (jsonMatch) {
//             return JSON.parse(jsonMatch[0]);
//         }
        
//         return [];
//     } catch (error) {
//         console.error('Error generating quiz:', error);
//         throw error;
//     }
// };

// /**
//  * Generate AI summary of text
//  * @param {string} text - The input text to summarize
//  * @returns {Promise<string>} - The generated summary
//  */

// export const generateSummary = async (text) => {
//     try {
//         const aiClient = getAI();
//         const prompt = `Summarize the following text in a concise way (max 200 words):

// ${text}`;

//         const response = await aiClient.models.generateContent({
//             model: 'gemini-2.0-flash',
//             contents: prompt,
//         });

//         return response.text;
//     } catch (error) {
//         console.error('Error generating summary:', error);
//         throw error;
//     }
// };

// export default {
//     generateFlashcards,
//     generateQuiz,
//     generateSummary
// };



