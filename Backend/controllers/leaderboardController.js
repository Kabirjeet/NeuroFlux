import asyncHandler from 'express-async-handler';
import PlayerScore from '../models/PlayerScore.js';
import User from '../models/User.js';

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// @desc    Submit/Update player score (highest score wins)
// @route   POST /api/leaderboard/score
// @access  Private
const submitScore = asyncHandler(async (req, res) => {
    const { gameType, score } = req.body;
    const userId = req.user.id;

    if (!gameType || typeof score !== 'number' || score < 0) {
        res.status(400);
        throw new Error('Invalid gameType or score');
    }

    const user = await User.findById(userId).select('username');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    const playerScore = await PlayerScore.updateHighestScore(
        userId,
        user.username,
        gameType,
        score
    );

    res.status(200).json({
        success: true,
        data: playerScore
    });
});

// @desc    Get global leaderboard (top 50, all-time, gameType='all')
// @route   GET /api/leaderboard/global
// @access  Public
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const leaderboard = await PlayerScore.find({ gameType: 'all' })
        .populate('userId', 'username profileImage')
        .sort({ score: -1 })
        .limit(50)
        .lean();

    // Add rank
    const ranked = leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry
    }));

    res.status(200).json({
        success: true,
        count: ranked.length,
        data: ranked
    });
});

// @desc    Get weekly leaderboard (top 50 current week)
// @route   GET /api/leaderboard/weekly
// @access  Public
const getWeeklyLeaderboard = asyncHandler(async (req, res) => {
    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const year = now.getFullYear();

    const leaderboard = await PlayerScore.find({ 
        gameType: 'all',
        year,
        weekNumber 
    })
        .populate('userId', 'username profileImage')
        .sort({ weeklyScore: -1 })
        .limit(50)
        .lean();

    const ranked = leaderboard.map((entry, index) => ({
        rank: index + 1,
        ...entry
    }));

    res.status(200).json({
        success: true,
        week: weekNumber,
        year,
        count: ranked.length,
        data: ranked
    });
});

export {
    submitScore,
    getGlobalLeaderboard,
    getWeeklyLeaderboard
};

