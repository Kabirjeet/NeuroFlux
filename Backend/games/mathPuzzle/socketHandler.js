import { broadcastRoomState } from '../common/multiplayerManager.js';

/**
 * MathPuzzle Socket.IO Handler
 * Multi-step math challenge game
 */

export const initMathPuzzleHandler = (io, socket) => {
  socket.on('joinMathPuzzle', (data) => {
    const result = createOrJoinRoom(socket, 'mathPuzzle', data.playerData);
    socket.emit('roomJoined', result);
  });

  socket.on('mathPuzzleStepAnswer', (data) => {
    socket.to(socket.roomId).emit('stepAnswer', {
      playerId: socket.id,
      step: data.step,
      answer: data.answer,
      correct: data.correct
    });
  });

  socket.on('requestPuzzle', () => {
    const puzzle = {
      steps: 3,
      equation: 'Solve step by step: 15 / 3 + 2 * 4',
      currentStep: 0
    };
    broadcastRoomState(io, socket.roomId, { puzzle });
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
  });
};

export default initMathPuzzleHandler;

