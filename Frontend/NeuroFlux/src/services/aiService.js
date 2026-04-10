import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const generateFlashcards = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS, { documentId, ...options });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to generate flashcards" };
    }
};

const generateSummary = async (documentId) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY, { documentId });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to generate summary" };
    }   
};

const generateQuiz = async (documentId, options) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ, { documentId, ...options });      
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to generate quiz" };
    }
};

const chat = async (documentId, message) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.CHAT, { documentId, question: message });
        return response.data.data; // Backend returns data.answer, data.relevantChunks
    } catch (error) {
        throw error.response?.data || { message: "Failed to send message" };
    }
};

const explainConcept = async (documentId, concept) => {
    try {
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT, { documentId, concept });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to explain concept" };
    }
};

const getChatHistory = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.AI.GET_CHAT_HISTORY(documentId));    
        return response.data.success ? response.data.data : [];
    } catch (error) {
        return []; // Gracefully handle no history
    }
};

const aiService = {
    generateFlashcards,
    generateSummary,
    generateQuiz,
    chat,
    explainConcept,
    getChatHistory
};

export default aiService;