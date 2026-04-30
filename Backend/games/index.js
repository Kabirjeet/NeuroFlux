/**
 * Games Socket Handlers Index
 * Unified multiplayer matchmaking, room state, and GameManager integration
 */

import {
  createOrJoinRoom,
  leaveRoom,
  rooms as mpRooms,
  players as mpPlayers
} from './common/multiplayerManager.js';

import {
  generateGameData as gmGenerate,
  validateAnswer as gmValidate
} from './gameManager.js';
import jwt from 'jsonwebtoken';
import PlayerScore from '../models/PlayerScore.js';
import User from '../models/User.js';

// Matchmaking queue: gameName -> Array of {socket, playerData}
const matchmakingQueue = new Map();

// Extended room state: roomId -> {players, gameName, gameData, scores, currentQuestionIndex, timer, status, answersReceived, timerValue}
const gameRooms = new Map();

const QUESTION_TIME_LIMIT = 15; // seconds per question
const PLAYERS_PER_MATCH = 2;
const NEXT_QUESTION_DELAY_MS = 1500;
const TIMEOUT_ADVANCE_DELAY_MS = 1000;
const ROOM_CLEANUP_DELAY_MS = 30000;

const logMultiplayerEvent = (event, roomId = '-', socketId = '-', details = {}) => {
  console.log(`[${event}] [${roomId || '-'}] [${socketId || '-'}]`, details);
};

/**
 * Initialize all game socket handlers
 */
export const initGameHandlers = (io, socket) => {
  // ------------------ MATCHMAKING ------------------

  socket.on('findMatch', ({ gameName, playerData } = {}) => {
    const normalizedGameName = typeof gameName === 'string' ? gameName.trim() : '';
    logMultiplayerEvent('matchmaking', '-', socket.id, {
      action: 'findMatch',
      gameName: normalizedGameName || gameName,
    });

    if (!normalizedGameName) {
      socket.emit('error', { message: 'Game name is required' });
      return;
    }

    if (socket.roomId || mpPlayers.has(socket.id)) {
      socket.emit('error', { message: 'Already in a game room' });
      return;
    }

    removeFromMatchmaking(socket.id);

    // Initialize queue for this game if not exists
    if (!matchmakingQueue.has(normalizedGameName)) {
      matchmakingQueue.set(normalizedGameName, []);
    }

    const queue = matchmakingQueue.get(normalizedGameName);
    pruneQueue(queue);

    // Check if player already in queue
    const alreadyInQueue = queue.some((p) => p.socket.id === socket.id);
    if (alreadyInQueue) {
      socket.emit('error', { message: 'Already in matchmaking queue' });
      return;
    }

    // Add player to queue
    queue.push({ socket, playerData: playerData || {} });
    logMultiplayerEvent('matchmaking', '-', socket.id, {
      action: 'queued',
      gameName: normalizedGameName,
      position: queue.length,
      queueSize: queue.length,
    });
    socket.emit('matchmaking', { status: 'waiting', gameName: normalizedGameName, position: queue.length });

    // Try to match if 2+ players waiting
    while (queue.length >= PLAYERS_PER_MATCH) {
      const player1 = queue.shift();
      const player2 = queue.shift();

      if (!isSocketAvailable(player1?.socket) || !isSocketAvailable(player2?.socket)) {
        if (isSocketAvailable(player2?.socket)) queue.unshift(player2);
        if (isSocketAvailable(player1?.socket)) queue.unshift(player1);
        pruneQueue(queue);
        continue;
      }

      const roomId = `${normalizedGameName}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      logMultiplayerEvent('room:created', roomId, player1.socket.id, {
        gameName: normalizedGameName,
        players: [player1.socket.id, player2.socket.id],
      });

      // Join both players to the same room
      createOrJoinRoom(player1.socket, roomId, normalizedGameName, player1.playerData);
      createOrJoinRoom(player2.socket, roomId, normalizedGameName, player2.playerData);

      // Initialize extended room state
      gameRooms.set(roomId, {
        roomId,
        gameName: normalizedGameName,
        players: new Map([
          [player1.socket.id, { socket: player1.socket, playerData: player1.playerData, score: 0, ready: false }],
          [player2.socket.id, { socket: player2.socket, playerData: player2.playerData, score: 0, ready: false }]
        ]),
        gameData: null,
        scores: {
          [player1.socket.id]: 0,
          [player2.socket.id]: 0
        },
        currentQuestionIndex: 0,
        timer: null,
        timerValue: QUESTION_TIME_LIMIT,
        status: 'waiting', // waiting -> starting -> playing -> ended
        answersReceived: new Set(),
        startTime: null,
        isTransitioning: false,
        isStarting: false,
        advanceTimeout: null,
        cleanupTimeout: null,
        timerToken: 0
      });

      // Notify both players
      io.to(roomId).emit('matchFound', {
        roomId,
        gameName: normalizedGameName,
        players: [
          { id: player1.socket.id, ...player1.playerData },
          { id: player2.socket.id, ...player2.playerData }
        ]
      });

      pruneQueue(queue);
    }

    if (queue.length === 0) {
      matchmakingQueue.delete(normalizedGameName);
    }
  });

  socket.on('cancelMatchmaking', ({ gameName } = {}) => {
    const normalizedGameName = typeof gameName === 'string' ? gameName.trim() : null;
    const removedGames = removeFromMatchmaking(socket.id, normalizedGameName);
    removedGames.forEach((removedGameName) => {
      logMultiplayerEvent('matchmaking', '-', socket.id, {
        action: 'cancelled',
        gameName: removedGameName,
      });
      socket.emit('matchmaking', { status: 'cancelled', gameName: removedGameName });
    });
  });

  function isSocketAvailable(candidateSocket) {
    return Boolean(candidateSocket?.connected && !candidateSocket.roomId && !mpPlayers.has(candidateSocket.id));
  }

  function pruneQueue(queue) {
    for (let i = queue.length - 1; i >= 0; i--) {
      if (!isSocketAvailable(queue[i].socket)) {
        queue.splice(i, 1);
      }
    }
  }

  function removeFromMatchmaking(playerId, gameName = null) {
    const removedGames = [];

    for (const [queuedGameName, queue] of matchmakingQueue.entries()) {
      if (gameName && queuedGameName !== gameName) continue;

      for (let i = queue.length - 1; i >= 0; i--) {
        if (queue[i].socket.id === playerId) {
          queue.splice(i, 1);
          removedGames.push(queuedGameName);
        }
      }

      pruneQueue(queue);
      if (queue.length === 0) {
        matchmakingQueue.delete(queuedGameName);
      }
    }

    return [...new Set(removedGames)];
  }

  // ------------------ GAME START ------------------

  socket.on('playerReady', async () => {
    const roomId = socket.roomId;
    if (!roomId || !gameRooms.has(roomId)) {
      socket.emit('error', { message: 'Not in a game room' });
      return;
    }

    const room = gameRooms.get(roomId);
    if (!room.players.has(socket.id)) return;
    if (room.status !== 'waiting') return;

    const player = room.players.get(socket.id);
    if (!player.ready) {
      player.ready = true;
      logMultiplayerEvent('playerReady', roomId, socket.id, {
        action: 'playerReady',
        readyCount: Array.from(room.players.values()).filter((p) => p.ready).length,
        playerCount: room.players.size,
      });
      socket.to(roomId).emit('playerReady', { playerId: socket.id });
    }

    // Check if all players are ready
    const allReady = Array.from(room.players.values()).every((p) => p.ready);
    if (allReady && !room.isStarting && !room.gameData) {
      room.isStarting = true;
      room.status = 'starting';

      try {
        // Generate game data ONCE using GameManager
        const gameData = await gmGenerate(room.gameName, { roomId });
        const activeRoom = gameRooms.get(roomId);
        if (!activeRoom || activeRoom !== room || room.status !== 'starting') return;

        room.gameData = gameData;
        room.currentQuestionIndex = 0;
        setGameDataQuestionIndex(room, 0);
        room.startTime = Date.now();
        room.status = 'playing';
        room.isStarting = false;
        room.answersReceived.clear();

        // Initialize scores
        for (const [playerId] of room.players) {
          room.scores[playerId] = 0;
        }

        // Emit to both players
        logMultiplayerEvent('game:start', roomId, socket.id, {
          gameName: room.gameName,
          playerIds: Array.from(room.players.keys()),
          currentQuestionIndex: 0,
          timeLimit: QUESTION_TIME_LIMIT,
        });
        io.to(roomId).emit('game:start', {
          gameData,
          currentQuestionIndex: 0,
          timeLimit: QUESTION_TIME_LIMIT,
          scores: room.scores
        });

        // Start server timer
        startRoomTimer(io, roomId);
      } catch (error) {
        room.status = 'waiting';
        room.isStarting = false;
        console.error('Failed to start game:', error);
        io.to(roomId).emit('error', { message: 'Failed to start game: ' + error.message });
      }
    }
  });

  // ------------------ ANSWER HANDLING ------------------

  socket.on('submitAnswer', async ({ answer, timeTaken, questionIndex } = {}) => {
    const roomId = socket.roomId;
    logMultiplayerEvent('submitAnswer', roomId, socket.id, {
      questionIndex,
      timeTaken,
    });
    if (!roomId || !gameRooms.has(roomId)) {
      socket.emit('error', { message: 'Not in a game room' });
      return;
    }

    const room = gameRooms.get(roomId);
    if (room.status !== 'playing' || !room.gameData || !room.players.has(socket.id)) return;
    if (Number.isInteger(questionIndex) && questionIndex !== room.currentQuestionIndex) return;
    if (room.answersReceived.has(socket.id)) return; // Already answered this question

    const questionIndexAtSubmit = room.currentQuestionIndex;
    room.answersReceived.add(socket.id); // Prevent race-condition duplicates

    try {
      // Validate answer using GameManager
      const validationGameData = cloneGameDataForQuestion(room.gameData, questionIndexAtSubmit);
      const validationResult = await gmValidate(room.gameName, answer, validationGameData);

      const activeRoom = gameRooms.get(roomId);
      if (!activeRoom || activeRoom !== room || room.status === 'ended') return;

      // Calculate points (base 100 + time bonus)
      const { correct, points, details } = getScoreForAnswer(validationResult, timeTaken);

      // Update score
      room.scores[socket.id] = (room.scores[socket.id] || 0) + points;

      // Broadcast updated scores to both players
      logMultiplayerEvent('scoreUpdate', roomId, socket.id, {
        correct,
        points,
        questionIndex: questionIndexAtSubmit,
        scores: room.scores,
        totalAnswered: room.answersReceived.size,
      });
      io.to(roomId).emit('scoreUpdate', {
        playerId: socket.id,
        correct,
        points,
        questionIndex: questionIndexAtSubmit,
        scores: room.scores,
        totalAnswered: room.answersReceived.size,
        result: details
      });

      // Check if all players answered
      const allAnswered = room.answersReceived.size >= room.players.size;
      if (allAnswered && room.currentQuestionIndex === questionIndexAtSubmit) {
        scheduleAdvance(io, roomId, NEXT_QUESTION_DELAY_MS);
      }
    } catch (error) {
      const activeRoom = gameRooms.get(roomId);
      if (activeRoom === room && room.currentQuestionIndex === questionIndexAtSubmit) {
        room.answersReceived.delete(socket.id);
      }

      console.error('Answer validation error:', error);
      socket.emit('error', { message: 'Failed to validate answer' });
    }
  });

  function cloneGameDataForQuestion(gameData, questionIndex) {
    const clonedGameData = Array.isArray(gameData)
      ? [...gameData]
      : { ...gameData };

    clonedGameData.currentQuestionIndex = questionIndex;
    return clonedGameData;
  }

  function getScoreForAnswer(validationResult, timeTaken) {
    const details = validationResult && typeof validationResult === 'object' ? validationResult : null;
    const correct = typeof validationResult === 'boolean'
      ? validationResult
      : Boolean(details?.isCorrect ?? details?.correct ?? details?.completed);

    if (details && Number.isFinite(details.score)) {
      return { correct, points: Math.max(0, details.score), details };
    }

    const normalizedTimeTaken = Number.isFinite(Number(timeTaken)) ? Number(timeTaken) : 0;
    const timeBonus = correct ? Math.max(0, Math.floor((QUESTION_TIME_LIMIT - normalizedTimeTaken) * 2)) : 0;

    return {
      correct,
      points: correct ? 100 + timeBonus : 0,
      details
    };
  }

  // ------------------ TIMER CONTROL ------------------

  function startRoomTimer(ioInstance, roomId) {
    const room = gameRooms.get(roomId);
    if (!room || room.status !== 'playing') return;

    clearRoomTimer(room);
    clearAdvanceTimeout(room);
    room.timerValue = QUESTION_TIME_LIMIT;
    room.answersReceived.clear();
    const timerToken = ++room.timerToken;

    // Emit initial timer
    ioInstance.to(roomId).emit('timer:update', {
      timeLeft: room.timerValue,
      currentQuestionIndex: room.currentQuestionIndex
    });

    room.timer = setInterval(() => {
      const activeRoom = gameRooms.get(roomId);
      if (!activeRoom || activeRoom !== room || room.status !== 'playing' || room.timerToken !== timerToken) {
        clearRoomTimer(room);
        return;
      }

      room.timerValue--;
      ioInstance.to(roomId).emit('timer:update', {
        timeLeft: room.timerValue,
        currentQuestionIndex: room.currentQuestionIndex
      });

      if (room.timerValue <= 0) {
        scheduleAdvance(ioInstance, roomId, TIMEOUT_ADVANCE_DELAY_MS);
      }
    }, 1000);
  }

  function clearRoomTimer(room) {
    if (!room) return;
    room.timerToken++;
    if (room.timer) {
      clearInterval(room.timer);
      room.timer = null;
    }
  }

  function clearAdvanceTimeout(room) {
    if (!room?.advanceTimeout) return;
    clearTimeout(room.advanceTimeout);
    room.advanceTimeout = null;
  }

  function scheduleAdvance(ioInstance, roomId, delayMs) {
    const room = gameRooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    if (room.advanceTimeout || room.isTransitioning) return;

    clearRoomTimer(room);
    room.advanceTimeout = setTimeout(() => {
      room.advanceTimeout = null;
      const activeRoom = gameRooms.get(roomId);
      if (!activeRoom || activeRoom !== room || room.status !== 'playing') return;

      advanceQuestion(ioInstance, roomId);
    }, delayMs);
  }

  async function advanceQuestion(ioInstance, roomId) {
    const room = gameRooms.get(roomId);
    if (!room || room.status !== 'playing') return;
    if (room.isTransitioning) return;

    room.isTransitioning = true;
    clearRoomTimer(room);
    clearAdvanceTimeout(room);
    room.currentQuestionIndex++;
    setGameDataQuestionIndex(room, room.currentQuestionIndex);

    // Check if game has ended
    const totalQuestions = getTotalQuestions(room.gameData);
    if (room.currentQuestionIndex >= totalQuestions) {
      await endGame(ioInstance, roomId);
      return;
    }

    // Reset for next question
    room.answersReceived.clear();

    // Emit next question to both players
    logMultiplayerEvent('game:nextQuestion', roomId, '-', {
      currentQuestionIndex: room.currentQuestionIndex,
      timeLimit: QUESTION_TIME_LIMIT,
      scores: room.scores,
    });
    ioInstance.to(roomId).emit('game:nextQuestion', {
      currentQuestionIndex: room.currentQuestionIndex,
      timeLimit: QUESTION_TIME_LIMIT,
      scores: room.scores
    });

    // Restart timer
    room.isTransitioning = false;
    startRoomTimer(ioInstance, roomId);
  }

  function getTotalQuestions(gameData) {
    if (Array.isArray(gameData)) return gameData.length || 1;
    if (Array.isArray(gameData?.questions)) return gameData.questions.length || 1;
    if (Array.isArray(gameData?.steps)) return gameData.steps.length || 1;
    return 1;
  }

  function setGameDataQuestionIndex(room, questionIndex) {
    if (room?.gameData && typeof room.gameData === 'object') {
      room.gameData.currentQuestionIndex = questionIndex;
    }
  }

  async function endGame(ioInstance, roomId) {
    const room = gameRooms.get(roomId);
    if (!room || room.status === 'ended') return;

    room.status = 'ended';
    room.isTransitioning = false;
    clearRoomTimer(room);
    clearAdvanceTimeout(room);

    // Calculate final scores via GameManager if needed
    const finalScores = {};
    for (const [playerId] of room.players) {
      finalScores[playerId] = room.scores[playerId] || 0;
    }

    // Determine winner
    let winnerId = null;
    let maxScore = -1;
    for (const [playerId, score] of Object.entries(finalScores)) {
      if (score > maxScore) {
        maxScore = score;
        winnerId = playerId;
      }
    }

    try {
      const endedAt = new Date();
      const weekDate = new Date(Date.UTC(endedAt.getFullYear(), endedAt.getMonth(), endedAt.getDate()));
      const dayNum = weekDate.getUTCDay() || 7;
      weekDate.setUTCDate(weekDate.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(weekDate.getUTCFullYear(), 0, 1));
      const weekNumber = Math.ceil((((weekDate - yearStart) / 86400000) + 1) / 7);
      const year = endedAt.getFullYear();

      await Promise.all(
        Array.from(room.players.entries()).map(async ([playerId, player]) => {
          const playerData = player?.playerData || {};
          let userId = playerData.userId || playerData._id;
          let username = playerData.username || playerData.name;

          if (!userId) {
            const token = player?.socket?.handshake?.auth?.token;
            if (token) {
              try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded?.id;
              } catch (error) {
                logMultiplayerEvent('leaderboard:authSkipped', roomId, playerId, {
                  message: error.message,
                });
              }
            }
          }

          if (!userId) {
            logMultiplayerEvent('leaderboard:saveSkipped', roomId, playerId, {
              reason: 'missingUserId',
            });
            return;
          }

          if (!username) {
            const user = await User.findById(userId).select('username').lean();
            username = user?.username;
          }

          if (!username) {
            logMultiplayerEvent('leaderboard:saveSkipped', roomId, playerId, {
              reason: 'missingUsername',
              userId,
            });
            return;
          }

          await PlayerScore.findOneAndUpdate(
            { userId, gameType: 'all' },
            {
              $max: {
                score: finalScores[playerId] || 0,
                weeklyScore: finalScores[playerId] || 0,
              },
              $set: {
                username,
                gameName: room.gameName,
                winner: playerId === winnerId,
                timestamp: endedAt,
                year,
                weekNumber,
              },
            },
            {
              upsert: true,
              new: true,
              setDefaultsOnInsert: true,
              strict: false,
            }
          );
        })
      );
    } catch (error) {
      logMultiplayerEvent('leaderboard:saveFailed', roomId, '-', {
        message: error.message,
      });
    }

    logMultiplayerEvent('game:end', roomId, '-', {
      scores: finalScores,
      winner: winnerId,
    });
    ioInstance.to(roomId).emit('game:end', {
      scores: finalScores,
      winner: winnerId,
      gameData: room.gameData
    });

    // Cleanup room after a delay
    room.cleanupTimeout = setTimeout(() => {
      cleanupRoom(roomId);
    }, ROOM_CLEANUP_DELAY_MS);
  }

  // ------------------ DISCONNECT ------------------

  socket.on('disconnect', () => {
    const roomId = socket.roomId;

    removeFromMatchmaking(socket.id);

    if (roomId && gameRooms.has(roomId)) {
      const room = gameRooms.get(roomId);

      // Notify opponent BEFORE any cleanup
      socket.to(roomId).emit('opponentDisconnected', {
        playerId: socket.id,
        reason: 'disconnected',
        message: 'Your opponent has disconnected'
      });

      // Clear all timers
      clearRoomTimer(room);
      clearAdvanceTimeout(room);

      // End game if still playing
      if (room.status === 'playing' || room.status === 'starting') {
        room.status = 'ended';
        room.isStarting = false;
        room.isTransitioning = false;
        const winnerId = Array.from(room.players.keys()).find((id) => id !== socket.id);
        logMultiplayerEvent('game:end', roomId, socket.id, {
          reason: 'opponentDisconnected',
          scores: room.scores,
          winner: winnerId,
        });
        io.to(roomId).emit('game:end', {
          reason: 'opponentDisconnected',
          scores: room.scores,
          winner: winnerId
        });
      }

      // Clean up all references for the room and all players
      cleanupRoom(roomId);
    }

    // Fallback: ensure disconnected socket is fully cleaned from multiplayerManager
    // This handles cases where the player was in mpRooms but not in gameRooms
    if (mpPlayers.has(socket.id)) {
      leaveRoom(socket, { notifyOthers: true, io, reason: 'disconnected' });
    }
  });

  // ------------------ CLEANUP ------------------

  function cleanupRoom(roomId) {
    const room = gameRooms.get(roomId);
    if (room) {
      // Clear all timers first
      clearRoomTimer(room);
      clearAdvanceTimeout(room);
      if (room.cleanupTimeout) {
        clearTimeout(room.cleanupTimeout);
        room.cleanupTimeout = null;
      }
      room.status = 'ended';
      room.isStarting = false;
      room.isTransitioning = false;

      // Clean up each player in the room
      room.players.forEach((p, playerId) => {
        p.socket?.leave(roomId);
        if (p.socket?.roomId === roomId) {
          p.socket.roomId = null;
        }
        mpPlayers.delete(playerId);
      });

      // Delete the game room
      gameRooms.delete(roomId);
    }

    // Clean up from multiplayerManager rooms
    if (mpRooms.has(roomId)) {
      mpRooms.delete(roomId);
    }
  }
};

/**
 * Legacy exports for backward compatibility
 * Fixed: properly imported from multiplayerManager instead of recursive self-reference
 */
export { createOrJoinRoom, leaveRoom };

export default initGameHandlers;
