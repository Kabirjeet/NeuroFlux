import axiosInstance from "../utils/axiosInstance";
import authService from './authService.js';

// Get global leaderboard (top 50)
export const getGlobalLeaderboard = async () => {
    const response = await axiosInstance.get('/leaderboard/global');
    return response.data;
};

// Get weekly leaderboard (current week top 50)
export const getWeeklyLeaderboard = async () => {
    const response = await axiosInstance.get('/leaderboard/weekly');
    return response.data;
};

// Submit player score after game
export const submitScore = async (gameType, score) => {
    // Token handled by axiosInstance interceptor
    
    const response = await axiosInstance.post('/leaderboard/score', 
        { gameType, score },
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};

