import { io } from 'socket.io-client';

const serverUrl = process.env.SOCKET_URL || 'http://localhost:8000';
const gameName = process.env.GAME_NAME || process.argv[2] || 'mindSnap';
const playerName = process.env.PLAYER_NAME || process.argv[3] || `debug-${process.pid}`;
const autoSubmit = process.env.AUTO_SUBMIT !== 'false';

let latestGameData = null;
let currentQuestionIndex = 0;
const submittedQuestions = new Set();

const socket = io(serverUrl, {
  auth: {
    token: process.env.SOCKET_TOKEN || 'debug-token',
  },
  transports: ['websocket', 'polling'],
});

const log = (event, payload = '') => {
  const stamp = new Date().toISOString();
  console.log(`[${stamp}] ${event}`, payload);
};

const getDebugAnswer = () => {
  const question = latestGameData?.questions?.[currentQuestionIndex];
  if (!question) return { answer: 'A' };

  if (question.correct !== undefined) return { answer: question.correct };
  if (question.expected !== undefined) return { answer: question.expected };
  if (question.answer !== undefined) return { answer: question.answer };
  if (question.solution !== undefined) return { answer: question.solution };

  return { answer: 'A' };
};

const submitDebugAnswer = () => {
  if (!autoSubmit) return;
  if (submittedQuestions.has(currentQuestionIndex)) return;

  submittedQuestions.add(currentQuestionIndex);
  const answer = getDebugAnswer();
  socket.emit('submitAnswer', {
    answer,
    timeTaken: 1,
    questionIndex: currentQuestionIndex,
  });
  log('emit:submitAnswer', { answer, questionIndex: currentQuestionIndex });
};

socket.on('connect', () => {
  log('connect', { socketId: socket.id, serverUrl, gameName, playerName });
  socket.emit('findMatch', {
    gameName,
    playerData: {
      name: playerName,
      debug: true,
    },
  });
  log('emit:findMatch', { gameName, playerName });
});

socket.on('connect_error', (error) => {
  log('connect_error', error.message);
});

socket.on('disconnect', (reason) => {
  log('disconnect', reason);
});

socket.on('matchmaking', (payload) => {
  log('matchmaking', payload);
});

socket.on('matchFound', (payload) => {
  log('matchFound', payload);
  socket.emit('playerReady');
  log('emit:playerReady');
});

socket.on('playerReady', (payload) => {
  log('playerReady', payload);
});

socket.on('game:start', (payload) => {
  log('game:start', payload);
  latestGameData = payload?.gameData || null;
  currentQuestionIndex = payload?.currentQuestionIndex ?? 0;
  setTimeout(submitDebugAnswer, 250);
});

socket.on('timer:update', (payload) => {
  log('timer:update', payload);
});

socket.on('scoreUpdate', (payload) => {
  log('scoreUpdate', payload);
});

socket.on('game:nextQuestion', (payload) => {
  log('game:nextQuestion', payload);
  currentQuestionIndex = payload?.currentQuestionIndex ?? currentQuestionIndex + 1;
  setTimeout(submitDebugAnswer, 250);
});

socket.on('game:end', (payload) => {
  log('game:end', payload);
});

socket.on('opponentDisconnected', (payload) => {
  log('opponentDisconnected', payload);
});

socket.on('error', (payload) => {
  log('error', payload);
});

process.on('SIGINT', () => {
  log('shutdown', 'disconnecting');
  socket.disconnect();
  process.exit(0);
});
