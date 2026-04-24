import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'
import errorHandler from './middleware/errorHandler.js'
import authRoutes from './routes/authRoutes.js'
import documentRoutes from './routes/documentRoutes.js'
import flashcardRoutes from './routes/flashcardRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js'


// ES6 module __dirname alternative
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

//Middleware to handle CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/flashcards', flashcardRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/leaderboard', leaderboardRoutes)



app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        statusCode: 404
    });
});

// Create HTTP server for Socket.IO compatibility
import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Game socket handlers
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    
    initGameHandlers(io, socket);
    
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

// Start Server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
    console.log(`Server + Socket.IO running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});
