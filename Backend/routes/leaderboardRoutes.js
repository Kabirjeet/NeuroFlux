import express from 'express';
import { body } from 'express-validator';
import protect from '../middleware/auth.js';
import {
    submitScore,
    getGlobalLeaderboard,
    getWeeklyLeaderboard
} from '../controllers/leaderboardController.js';

const router = express.Router();

// Submit score (protected)
router.post('/score', 
    protect,
    [
        body('gameType').isString().notEmpty().withMessage('Game type required'),
        body('score').isNumeric().isFloat({ min: 0 }).withMessage('Valid score required')
    ],
    submitScore
);

// Public leaderboards
router.get('/global', getGlobalLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;

