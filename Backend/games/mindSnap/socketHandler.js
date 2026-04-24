import { broadcastRoomState, createOrJoinRoom, leaveRoom } from '../common/multiplayerManager.js';
import { generateGameData, validateAnswer, calculateScore } from '../gameManager.js';

const mindSnapRooms = new Map(); // roomId -> {gameData, playerAnswers: Map<playerId, array>, questionTimeouts: NodeJS.Timeout}

/**
 * MindSnap Socket.IO Handler
 * Quick mental math challenge game
 */

export const initMindSnapHandler = (io, socket) => {
  console.log(`Player ${socket.id} connected to mindSnap`);

  socket.on('joinMindSnap', (data) => {
    const { roomId, playerData } = data;
    const result = createOrJoinRoom(socket, 'mindSnap', playerData);
    
    socket.emit('roomJoined', result);
    socket.to(roomId).emit('playerJoined', { playerId: socket.id, ...playerData });
  });

  socket.on('mindSnapAnswer', async (data) => {
    const roomId = socket.roomId;
    const room = mindSnapRooms.get(roomId);
    if (!room) return;

    const { answer, timeTaken, questionIndex } = data;
    const isValid = await validateAnswer('mindSnap', answer, room.gameData);
    
    if (!room.playerAnswers.has(socket.id)) {
      room.playerAnswers.set(socket.id, []);
    }
    room.playerAnswers.get(socket.id).push({ questionIndex, answer, timeTaken, correct: isValid });
    
    // Broadcast to room
    socket.to(roomId).emit('playerAnswered', {
      playerId: socket.id,
      questionIndex,
      correct: isValid,
      timeTaken
    });
    
    // Reset current players for next question
    room.currentPlayers.clear();
    
    // Check if all players answered or timeout
    checkAdvanceQuestion(io, roomId, room);
  });

  socket.on('startMindSnapDuel', async () => {
    const roomId = socket.roomId;
    if (mindSnapRooms.has(roomId)) return; // Already started

    const gameData = await generateGameData('mindSnap');
    mindSnapRooms.set(roomId, {
      gameData,
      playerAnswers: new Map(),
      currentPlayers: new Set() // Track who answered current question
    });

    broadcastRoomState(io, roomId, { 
      event: 'duelStarted',
      gameData: {
        questions: gameData.questions,
        currentQuestionIndex: 0,
        timeLimit: 10
      }
    });
    startQuestionTimer(io, roomId);
  });

  socket.on('startMindSnapRound', () => {
    const gameState = {
      round: Math.floor(Math.random() * 10) + 5,
      equation: '12 + 8 * 2', // Generate dynamically
      timeLimit: 10
    };
    broadcastRoomState(io, socket.roomId, { gameState });
  });

  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (roomId && mindSnapRooms.has(roomId)) {
      const room = mindSnapRooms.get(roomId);
      room.playerAnswers.delete(socket.id);
      if (room.questionTimeout) {
        clearTimeout(room.questionTimeout);
      }
    }
    leaveRoom(socket);
    mindSnapRooms.delete(roomId); // Cleanup if empty
  });
};

// Helper functions
const startQuestionTimer = (io, roomId) => {
  const room = mindSnapRooms.get(roomId);
  if (!room) return;

  room.questionTimeout = setTimeout(() => {
    advanceQuestion(io, roomId, room);
  }, 10000); // 10s
};

const checkAdvanceQuestion = (io, roomId, room) => {
  const roomData = mindSnapRooms.get(roomId);
  const allAnswered = Array.from(roomData.playerAnswers.keys()).every(playerId => 
    roomData.playerAnswers.get(playerId).some(ans => ans.questionIndex === roomData.gameData.currentQuestionIndex)
  );

  if (allAnswered || roomData.currentPlayers.size === roomData.playerAnswers.size) {
    if (roomData.questionTimeout) {
      clearTimeout(roomData.questionTimeout);
    }
    advanceQuestion(io, roomId, roomData);
  }
};

const advanceQuestion = (io, roomId, room) => {
  room.gameData.currentQuestionIndex++;
  if (room.gameData.currentQuestionIndex >= room.gameData.questions.length) {
    // End game
    endDuel(io, roomId, room);
  } else {
    // Next question
    broadcastRoomState(io, roomId, {
      event: 'nextQuestion',
      currentQuestionIndex: room.gameData.currentQuestionIndex,
      timeLimit: 10
    });
    startQuestionTimer(io, roomId);
  }
};

const endDuel = async (io, roomId, room) => {
  const scores = {};
  for (const [playerId, answers] of room.playerAnswers) {
    scores[playerId] = await calculateScore('mindSnap', answers);
  }

  broadcastRoomState(io, roomId, {
    event: 'duelEnded',
    scores,
    finalGameData: room.gameData
  });

  // Cleanup
  if (room.questionTimeout) clearTimeout(room.questionTimeout);
  mindSnapRooms.delete(roomId);
};

export default initMindSnapHandler;

export default initMindSnapHandler;

