import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable Socket.IO hook for NeuroFlux multiplayer games
 * Features: connect, join room, receive game data, send answers, opponent updates
 * @param {Object} options
 * @param {string} options.gameName - e.g. 'mindSnap', 'kenken'
 * @param {Function} [options.onGameData] - (gameData) => {}
 * @param {Function} [options.onOpponentScore] - (scores) => {}
 * @param {Function} [options.onPlayerAnswered] - (data) => {} playerId, correct, timeTaken
 * @param {Function} [options.onRoomUpdate] - (roomState) => {}
 */

export const useSocket = ({ gameName, onGameData, onOpponentScore, onPlayerAnswered, onRoomUpdate }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const { token } = useAuth();
  const callbacksRef = useRef({ onGameData, onOpponentScore, onPlayerAnswered, onRoomUpdate });
  const gameNameRef = useRef(gameName);

  // Update callbacks ref
  useEffect(() => {
    callbacksRef.current = { onGameData, onOpponentScore, onPlayerAnswered, onRoomUpdate };
  }, [onGameData, onOpponentScore, onPlayerAnswered, onRoomUpdate]);

  useEffect(() => {
    gameNameRef.current = gameName;
  }, [gameName]);

  const joinRoom = useCallback((roomIdParam, playerData) => {
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return;
    }
    const joinEvent = `join${gameName.charAt(0).toUpperCase() + gameName.slice(1)}`;
    socket.emit(joinEvent, { roomId: roomIdParam, playerData });
    setRoomId(roomIdParam);
    setIsInRoom(true);
  }, [socket, isConnected, gameName]);

  const sendAnswer = useCallback((data) => {
    if (!socket || !isConnected || !roomId) {
      console.error('Cannot send answer: not connected or no room');
      return;
    }
    const answerEvent = `${gameName}Answer`;
    socket.emit(answerEvent, data);
  }, [socket, isConnected, roomId, gameName]);

  const startDuel = useCallback(() => {
    if (!socket || !isConnected || !roomId) return;
    const startEvent = `start${gameName.charAt(0).toUpperCase() + gameName.slice(1)}Duel`;
    socket.emit(startEvent);
  }, [socket, isConnected, roomId, gameName]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit('leaveRoom');
      setIsInRoom(false);
      setRoomId(null);
    }
  }, [socket]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
    setIsInRoom(false);
    setRoomId(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      if (!token) return;

      try {
        const connectedSocket = await socketService.connect(token);
        if (mounted) {
          setSocket(connectedSocket);
        }

        connectedSocket.on('connect', () => {
          if (mounted) setIsConnected(true);
        });

        connectedSocket.on('disconnect', () => {
          if (mounted) {
            setIsConnected(false);
            setIsInRoom(false);
          }
        });

        // Generic listeners
        connectedSocket.on('roomJoined', (data) => {
          if (mounted) {
            console.log('Room joined:', data);
            setIsInRoom(true);
            setRoomId(data.roomId || roomId);
          }
        });

        connectedSocket.on('playerJoined', (playerData) => {
          console.log('Player joined:', playerData);
        });

        // Game events - dynamic and common
        connectedSocket.on('duelStarted', (data) => {
          if (mounted && callbacksRef.current.onGameData) {
            callbacksRef.current.onGameData(data.gameData);
          }
        });

        connectedSocket.on('nextQuestion', (data) => {
          if (mounted && callbacksRef.current.onGameData) {
            callbacksRef.current.onGameData(data);
          }
        });

        connectedSocket.on('playerAnswered', (data) => {
          // Filter opponent (not self)
          if (data.playerId !== socket?.id && callbacksRef.current.onPlayerAnswered) {
            callbacksRef.current.onPlayerAnswered(data);
          }
        });

        connectedSocket.on('duelEnded', (data) => {
          if (mounted && callbacksRef.current.onOpponentScore) {
            callbacksRef.current.onOpponentScore(data.scores);
          }
        });

        // Game-specific room state updates
        connectedSocket.on('roomState', (data) => {
          if (mounted && callbacksRef.current.onRoomUpdate) {
            callbacksRef.current.onRoomUpdate(data);
          }
        });

      } catch (error) {
        console.error('Socket connection failed:', error);
      }
    };

    connectSocket();

    return () => {
      mounted = false;
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('roomJoined');
        socket.off('playerJoined');
        socket.off('duelStarted');
        socket.off('nextQuestion');
        socket.off('playerAnswered');
        socket.off('duelEnded');
        socket.off('roomState');
      }
      leaveRoom();
    };
  }, [token, leaveRoom]);

  return {
    socket,
    isConnected,
    isInRoom,
    roomId,
    joinRoom,
    sendAnswer,
    startDuel,
    leaveRoom,
    disconnect
  };
};

// Usage example:
/*
const MyGame = () => {
  const { joinRoom, sendAnswer, isConnected } = useSocket({
    gameName: 'mindSnap',
    onGameData: (data) => console.log('Game data:', data),
    onOpponentScore: (scores) => console.log('Scores:', scores),
    onPlayerAnswered: (data) => console.log('Opponent answered:', data)
  });

  return <div>...</div>;
};
*/

