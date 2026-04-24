import { broadcastRoomState } from '../common/multiplayerManager.js';

/**
 * MemoryMatrix Socket.IO Handler
 * Pattern memory game
 */

export const initMemoryMatrixHandler = (io, socket) => {
  socket.on('joinMemoryMatrix', (data) => {
    const result = createOrJoinRoom(socket, 'memoryMatrix', data.playerData);
    socket.emit('roomJoined', result);
  });

  socket.on('matrixPatternSeen', (duration) => {
    socket.to(socket.roomId).emit('patternDuration', { playerId: socket.id, duration });
  });

  socket.on('matrixGuess', (positions) => {
    // Broadcast guess for scoring
    socket.to(socket.roomId).emit('guessReceived', {
      playerId: socket.id,
      positions,
      score: positions.length === 4 ? 100 : 0 // Example scoring
    });
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
  });
};

export default initMemoryMatrixHandler;

