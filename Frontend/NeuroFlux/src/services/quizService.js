import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

const getAllQuizzes = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_ALL_QUIZZES);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch all quizzes" };
    }
};

const getQuizzesForDocument = async (documentId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZZES_FOR_DOC(documentId));
        return response.data;
    }
    catch (error) {
        throw error.response?.data || { message: "Failed to fetch quizzes for document" };
    }
};

const getQuizById = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_BY_ID(quizId));
        return response.data;
    }
    catch (error) {
        throw error.response?.data || { message: "Failed to fetch quiz by ID" };
    }
};

const submitQuiz= async (quizId, answers) => {
    try {
        // Convert answers object to array format expected by backend
        // Backend expects: [{ questionIndex: 0, selectedOption: "answer" }, ...]
        const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
            questionIndex: parseInt(questionIndex),
            selectedOption
        }));
        
        const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT_QUIZ(quizId), { answers: formattedAnswers });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to submit quiz" };
    }
};

const getQuizResults = async (quizId) => {
    try {
        const response = await axiosInstance.get(API_PATHS.QUIZZES.GET_QUIZ_RESULTS(quizId));  
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to fetch quiz results" };
    }
};

const deleteQuiz = async (quizId) => {
    try {
        const response = await axiosInstance.delete(API_PATHS.QUIZZES.DELETE_QUIZ(quizId));
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "Failed to delete quiz" };
    }
};

const quizService = {
    getAllQuizzes,
    getQuizzesForDocument,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
    // Aliases
    getQuizzes: getQuizzesForDocument,
};

export default quizService;
