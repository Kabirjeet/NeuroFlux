import express from 'express';
import{
    getQuizzes,
    getAllQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz,
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// All routes are protected 
router.use(protect);

// Get all quizzes for the user
router.get('/', getAllQuizzes);
router.get('/:documentId', getQuizzes);
router.get('/quiz/:id', getQuizById);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);

export default router;
