import { broadcastRoomState } from '../common/multiplayerManager.js';

/**
 * ConceptClash Socket.IO Handler
 * Quiz battle game
 */

export const initConceptClashHandler = (io, socket) => {
  socket.on('joinConceptClash', (data) => {
    const result = createOrJoinRoom(socket, 'conceptClash', data.playerData);
    socket.emit('roomJoined', result);
  });

  socket.on('conceptAnswer', (data) => {
    socket.to(socket.roomId).emit('answerReceived', {
      playerId: socket.id,
      questionId: data.questionId,
      answer: data.answer,
      correct: data.correct
    });
  });

  socket.on('nextConceptQuestion', () => {
    const question = {
      id: Date.now(),
      text: 'What is React?',
      options: ['Library', 'Framework', 'Language'],
      correct: 0
    };
    broadcastRoomState(io, socket.roomId, { question });
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
  });
};

export default initConceptClashHandler;

