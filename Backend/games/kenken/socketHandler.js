import { broadcastRoomState } from '../common/multiplayerManager.js';

/**
 * KenKen Socket.IO Handler
 * Logic puzzle grid game
 */

export const initKenkenHandler = (io, socket) => {
  socket.on('joinKenken', (data) => {
    const result = createOrJoinRoom(socket, 'kenken', data.playerData);
    socket.emit('roomJoined', result);
  });

  socket.on('kenkenCellUpdate', (data) => {
    // Broadcast cell updates to all players
    socket.to(socket.roomId).emit('cellUpdated', {
      playerId: socket.id,
      row: data.row,
      col: data.col,
      value: data.value
    });
  });

  socket.on('kenkenComplete', () => {
    // Check win condition and broadcast
    broadcastRoomState(io, socket.roomId, { 
      winner: socket.id,
      status: 'completed' 
    });
  });

  socket.on('disconnect', () => {
    leaveRoom(socket);
  });
};

export default initKenkenHandler;

