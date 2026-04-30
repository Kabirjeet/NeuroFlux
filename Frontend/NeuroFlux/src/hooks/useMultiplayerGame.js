import { useState, useEffect, useCallback, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../context/AuthContext';

/**
 * Unified multiplayer game hook for NeuroFlux
 *
 * Handles the full matchmaking + gameplay lifecycle:
 *  findMatch -> matchFound -> playerReady -> game:start -> timer:update
 *  submitAnswer -> scoreUpdate -> game:nextQuestion -> game:end
 */

export const useMultiplayerGame = () => {
  const { token: authToken } = useAuth();
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const token = authToken || storedToken;

  // Connection / matchmaking state
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [matchStatus, setMatchStatus] = useState('idle'); // idle | waiting | matched | playing | ended
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [readyPlayers, setReadyPlayers] = useState([]);

  // Gameplay state
  const [gameData, setGameData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [winner, setWinner] = useState(null);
  const [lastScoreUpdate, setLastScoreUpdate] = useState(null);
  const [endReason, setEndReason] = useState(null);

  // Error / opponent disconnect
  const [error, setError] = useState(null);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  // Refs to avoid stale closures in socket callbacks
  const socketRef = useRef(null);
  const currentQuestionIndexRef = useRef(0);
  const handlersRef = useRef({});

  // Keep socketRef in sync
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  const resetGameState = useCallback(() => {
    setGameData(null);
    setCurrentQuestionIndex(0);
    setScores({});
    setTimeLeft(null);
    setWinner(null);
    setLastScoreUpdate(null);
    setEndReason(null);
    setOpponentDisconnected(false);
    setReadyPlayers([]);
  }, []);

  const resetRoomState = useCallback(() => {
    setMatchStatus('idle');
    setRoomId(null);
    setPlayers([]);
    resetGameState();
  }, [resetGameState]);

  // Removes only listeners registered by this hook.
  const cleanupListeners = useCallback((s) => {
    if (!s) return;
    const h = handlersRef.current;
    Object.entries(h).forEach(([event, handler]) => {
      if (handler) {
        s.off(event, handler);
      }
    });
    handlersRef.current = {};
  }, []);

  // Main effect: connect socket and register listeners once
  useEffect(() => {
    if (!token) {
      resetRoomState();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    let mounted = true;
    let currentSocket = null;

    const connect = async () => {
      try {
        const s = await socketService.connect(token);
        if (!mounted) {
          // If unmounted before connect resolved, clean up immediately
          s.disconnect();
          return;
        }
        currentSocket = s;
        setSocket(s);

        const onConnect = () => {
          if (!mounted) return;
          setIsConnected(true);
          setError(null);
        };

        const onDisconnect = () => {
          if (!mounted) return;
          setIsConnected(false);
          resetRoomState();
        };

        const onConnectError = (err) => {
          if (!mounted) return;
          setIsConnected(false);
          setError(err.message || 'Connection error');
        };

        const onMatchmaking = (data) => {
          if (!mounted) return;
          const payload = data || {};
          if (payload.status === 'waiting') {
            setMatchStatus('waiting');
            setEndReason(null);
            setError(null);
          } else if (payload.status === 'cancelled') {
            resetRoomState();
          }
        };

        const onMatchFound = (data) => {
          if (!mounted) return;
          const payload = data || {};
          resetGameState();
          setMatchStatus('matched');
          setRoomId(payload.roomId || null);
          setPlayers(payload.players || []);
          setScores(
            (payload.players || []).reduce((acc, player) => {
              if (player?.id) acc[player.id] = 0;
              return acc;
            }, {})
          );
          if (s.id) {
            setReadyPlayers([s.id]);
          }
          setError(null);
          s.emit('playerReady');
        };

        const onReadyAck = (playerId) => {
          if (!playerId) return;
          setReadyPlayers((prev) => (
            prev.includes(playerId) ? prev : [...prev, playerId]
          ));
        };

        const onPlayerReady = (data) => {
          if (!mounted || !data?.playerId) return;
          onReadyAck(data.playerId);
        };

        const onGameStart = (data) => {
          if (!mounted) return;
          const payload = data || {};
          setMatchStatus('playing');
          setGameData(payload.gameData || null);
          setCurrentQuestionIndex(payload.currentQuestionIndex ?? 0);
          setScores(payload.scores || {});
          setTimeLeft(payload.timeLimit ?? null);
          setWinner(null);
          setLastScoreUpdate(null);
          setEndReason(null);
          setOpponentDisconnected(false);
        };

        const onTimerUpdate = (data) => {
          if (!mounted) return;
          const payload = data || {};
          setTimeLeft(payload.timeLeft ?? null);
          if (Number.isInteger(payload.currentQuestionIndex)) {
            setCurrentQuestionIndex(payload.currentQuestionIndex);
          }
        };

        const onScoreUpdate = (data) => {
          if (!mounted) return;
          const payload = data || {};
          setLastScoreUpdate(payload);
          setScores((prev) => ({
            ...prev,
            ...(payload.scores || {}),
          }));
        };

        const onGameNextQuestion = (data) => {
          if (!mounted) return;
          const payload = data || {};
          setMatchStatus('playing');
          setCurrentQuestionIndex(payload.currentQuestionIndex ?? 0);
          setScores((prev) => ({
            ...prev,
            ...(payload.scores || {}),
          }));
          setTimeLeft(payload.timeLimit ?? null);
          setLastScoreUpdate(null);
        };

        const onGameEnd = (data) => {
          if (!mounted) return;
          const payload = data || {};
          setMatchStatus('ended');
          setScores((prev) => ({
            ...prev,
            ...(payload.scores || {}),
          }));
          setWinner(payload.winner || null);
          if (Object.prototype.hasOwnProperty.call(payload, 'gameData')) {
            setGameData(payload.gameData || null);
          }
          setTimeLeft(null);
          setEndReason(payload.reason || null);
        };

        const onOpponentDisconnected = (data) => {
          if (!mounted) return;
          setOpponentDisconnected(true);
          setEndReason(data?.reason || 'opponentDisconnected');
        };

        const onError = (data) => {
          if (!mounted) return;
          setError(data?.message || 'Unknown error');
        };

        cleanupListeners(s);

        // Store references so cleanup can remove them exactly
        handlersRef.current = {
          connect: onConnect,
          disconnect: onDisconnect,
          connect_error: onConnectError,
          matchmaking: onMatchmaking,
          matchFound: onMatchFound,
          playerReady: onPlayerReady,
          'game:start': onGameStart,
          'timer:update': onTimerUpdate,
          scoreUpdate: onScoreUpdate,
          'game:nextQuestion': onGameNextQuestion,
          'game:end': onGameEnd,
          opponentDisconnected: onOpponentDisconnected,
          error: onError,
        };

        Object.entries(handlersRef.current).forEach(([event, handler]) => {
          s.on(event, handler);
        });

        // Set initial connected state if already connected
        if (s.connected) {
          setIsConnected(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Failed to connect');
        }
      }
    };

    connect();

    return () => {
      mounted = false;
      cleanupListeners(currentSocket);
      if (currentSocket) {
        currentSocket.disconnect();
      }
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      resetRoomState();
    };
  }, [token, cleanupListeners, resetGameState, resetRoomState]);

  // ---- Actions exposed to UI ----

  const findMatch = useCallback(
    (gameName, playerData = {}) => {
      const s = socketRef.current;
      if (!s || !s.connected) {
        setError('Socket not connected');
        return;
      }
      setError(null);
      resetGameState();
      setMatchStatus('idle');
      setRoomId(null);
      setPlayers([]);
      s.emit('findMatch', { gameName, playerData });
    },
    [resetGameState]
  );

  const cancelMatchmaking = useCallback(
    (gameName) => {
      const s = socketRef.current;
      if (!s || !s.connected) return;
      s.emit('cancelMatchmaking', { gameName });
      resetRoomState();
    },
    [resetRoomState]
  );

  const readyUp = useCallback(() => {
    const s = socketRef.current;
    if (!s || !s.connected) {
      setError('Socket not connected');
      return;
    }
    if (s.id) {
      setReadyPlayers((prev) => (
        prev.includes(s.id) ? prev : [...prev, s.id]
      ));
    }
    s.emit('playerReady');
  }, []);

  const submitAnswer = useCallback(
    (answer, timeTaken = 0, questionIndex = currentQuestionIndexRef.current) => {
      const s = socketRef.current;
      if (!s || !s.connected) {
        setError('Socket not connected');
        return;
      }
      s.emit('submitAnswer', { answer, timeTaken, questionIndex });
    },
    []
  );

  const disconnect = useCallback(() => {
    const s = socketRef.current;
    cleanupListeners(s);
    if (s) {
      s.disconnect();
    }
    socketService.disconnect();
    setSocket(null);
    setIsConnected(false);
    resetRoomState();
    setError(null);
  }, [cleanupListeners, resetRoomState]);

  return {
    // State
    socket,
    isConnected,
    matchStatus,
    roomId,
    players,
    readyPlayers,
    gameData,
    currentQuestionIndex,
    scores,
    timeLeft,
    winner,
    lastScoreUpdate,
    endReason,
    error,
    opponentDisconnected,

    // Actions
    findMatch,
    cancelMatchmaking,
    readyUp,
    submitAnswer,
    disconnect,
  };
};

export default useMultiplayerGame;
