/**
 * Games Socket Handlers Index
 * Initialize all game handlers + GameManager integration
 */

import { initMindSnapHandler } from './mindSnap/socketHandler.js';
import { initKenkenHandler } from './kenken/socketHandler.js';
import { initMathPuzzleHandler } from './mathPuzzle/socketHandler.js';
import { initMemoryMatrixHandler } from './memoryMatrix/socketHandler.js';
import { initConceptClashHandler } from './conceptClash/socketHandler.js';

import gameManager, { getGame, generateGameData as gmGenerate, validateAnswer as gmValidate, calculateScore as gmCalc } from './gameManager.js';

const gameHandlers = {
  mindSnap: initMindSnapHandler,
  kenken: initKenkenHandler,
  mathPuzzle: initMathPuzzleHandler,
  memoryMatrix: initMemoryMatrixHandler,
  conceptClash: initConceptClashHandler
};

export const createOrJoinRoom = (...args) => createOrJoinRoom(...args);
export const leaveRoom = (...args) => leaveRoom(...args);

export const initGameHandlers = (io, socket) => {
  // Existing game selection
  socket.on('selectGame', (gameName) => {
    if (gameHandlers[gameName]) {
      gameHandlers[gameName](io, socket);
      console.log(`Initialized ${gameName} for socket ${socket.id}`);
    } else {
      socket.emit('error', 'Game not found');
    }
  });

  // NEW: GameManager unified events
  socket.on('generateGameData', async (gameName) => {
    try {
      const data = await gmGenerate(gameName);
      socket.emit('gameData', data);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('validateAnswer', async ({gameName, userAnswer, gameData}) => {
    try {
      const isValid = await gmValidate(gameName, userAnswer, gameData);
      socket.emit('answerValid', isValid);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  socket.on('calculateScore', async ({gameName, results}) => {
    try {
      const score = await gmCalc(gameName, results);
      socket.emit('score', score);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
};

export default initGameHandlers;
export { gameManager, getGame };

