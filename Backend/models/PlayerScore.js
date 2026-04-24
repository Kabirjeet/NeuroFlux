import mongoose from 'mongoose';

const playerScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    gameType: {
        type: String,
        enum: ['all', 'mindSnap', 'kenken', 'mathPuzzle', 'memoryMatrix', 'conceptClash'],
        default: 'all'
    },
    score: {
        type: Number,
        default: 0,
        min: 0
    },
    weeklyScore: {
        type: Number,
        default: 0,
        min: 0
    },
    weekNumber: {
        type: Number, // 1-52
        min: 1,
        max: 52
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
playerScoreSchema.index({ gameType: 1, score: -1 });
playerScoreSchema.index({ gameType: 1, weeklyScore: -1, year: -1, weekNumber: -1 });
playerScoreSchema.index({ userId: 1, gameType: 1 }, { unique: true }); // One score per user/game

// Update highest score only (not sum/add)
playerScoreSchema.statics.updateHighestScore = async function(userId, username, gameType, newScore) {
    const now = new Date();
    const week = getWeekNumber(now);
    const year = now.getFullYear();
    
    return await this.findOneAndUpdate(
        { 
            userId, 
            gameType,
            year,
            weekNumber: week 
        },
        { 
            username,
            score: Math.max(newScore, this.score || 0),
            weeklyScore: Math.max(newScore, this.weeklyScore || 0),
            year,
            weekNumber: week
        },
        { 
            upsert: true,
            new: true 
        }
    );
};

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}

const PlayerScore = mongoose.model('PlayerScore', playerScoreSchema);

export default PlayerScore;

