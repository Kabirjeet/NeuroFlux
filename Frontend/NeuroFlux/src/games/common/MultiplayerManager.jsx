import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../../services/socketService';
import { useAuth } from '../../context/AuthContext';

/**
 * Multiplayer Context Manager
 */

const MultiplayerContext = createContext();

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    let connectedSocket;

    const initSocket = async () => {
      if (token) {
        try {
          connectedSocket = await socketService.connect(token);
          setSocket(connectedSocket);
        } catch (error) {
          console.error('Failed to connect socket:', error);
        }
      }
    };

    initSocket();

    return () => {
      if (connectedSocket) {
        socketService.disconnect();
      }
    };
  }, [token]);

  const joinRoom = (gameName, playerData) => {
    socket?.emit('joinGameRoom', { 
      gameName, 
      playerData,
      roomId: `room_${gameName}_${Date.now()}` 
    });
  };

  const selectGame = (gameName) => {
    socketService.selectGame(gameName);
  };

  return (
    <MultiplayerContext.Provider value={{
      socket,
      currentRoom,
      players,
      joinRoom,
      selectGame
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};
