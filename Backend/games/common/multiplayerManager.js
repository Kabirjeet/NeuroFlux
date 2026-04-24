/**
 * Common Multiplayer Manager for NeuroFlux Games
 * Handles rooms, player management, game state sync
 */

// Game room registry
const rooms = new Map();
const players = new Map();

/**
 * Create or join game room
 */
export const createOrJoinRoom = (socket, gameName, playerData) => {
  const roomId = `${gameName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      gameName,
      players: new Set(),
      state: 'waiting',
      maxPlayers: 4,
      creator: socket.id
    });
  }
  
  const room = rooms.get(roomId);
  room.players.add(socket.id);
  players.set(socket.id, { roomId, ...playerData });
  
  socket.join(roomId);
  socket.roomId = roomId;
  
  return { roomId, room, isCreator: socket.id === room.creator };
};

/**
 * Leave room and cleanup
 */
export const leaveRoom = (socket) => {
  if (players.has(socket.id)) {
    const player = players.get(socket.id);
    const room = rooms.get(player.roomId);
    
    if (room) {
      room.players.delete(socket.id);
      if (room.players.size === 0) {
        rooms.delete(player.roomId);
      }
    }
    players.delete(socket.id);
    socket.leave(socket.roomId);
  }
};

/**
 * Broadcast room state to players
 */
export const broadcastRoomState = (io, roomId, stateUpdate) => {
  io.to(roomId).emit('roomUpdate', stateUpdate);
};

export default { createOrJoinRoom, leaveRoom, broadcastRoomState };

