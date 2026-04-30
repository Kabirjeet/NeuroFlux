/**
 * GameManager - Central module for all NeuroFlux games
 * Dynamically loads game logic and provides unified interface
 */

const games = ['mindSnap', 'kenken', 'mathPuzzle', 'memoryMatrix', 'conceptClash'];

const requiredMethods = ['generateGameData', 'validateAnswer', 'calculateScore'];

/**
 * Load game module dynamically
 * @param {string} gameName - Game identifier
 * @returns {Promise<{generateGameData, validateAnswer, calculateScore}>}
 */
export const getGame = async (gameName) => {
  if (!games.includes(gameName)) {
    throw new Error(`Game ${gameName} not found`);
  }

  try {
    const module = await import(`./${gameName}/utils.js`);
    const gameLogic = module.default || module;

    for (const method of requiredMethods) {
      if (typeof gameLogic[method] !== 'function') {
        throw new Error(`Game ${gameName} is missing ${method}()`);
      }
    }

    return {
      generateGameData: gameLogic.generateGameData,
      validateAnswer: gameLogic.validateAnswer,
      calculateScore: gameLogic.calculateScore
    };
  } catch (error) {
    console.error(`Failed to load game ${gameName}:`, error);
    throw error;
  }
};

/**
 * Generate game data for any game
 */
export const generateGameData = async (gameName, options = {}) => {
  const game = await getGame(gameName);
  const gameData = await game.generateGameData(options);

  if (!gameData || typeof gameData !== 'object') {
    throw new Error(`Game ${gameName} returned invalid gameData`);
  }

  if (!Array.isArray(gameData.questions)) {
    throw new Error(`Game ${gameName} must return gameData.questions`);
  }

  return {
    ...gameData,
    type: gameData.type || gameName,
    currentQuestionIndex: Number.isInteger(gameData.currentQuestionIndex)
      ? gameData.currentQuestionIndex
      : 0,
    totalQuestions: gameData.questions.length,
    timeLimit: gameData.timeLimit || 15
  };
};

/**
 * Validate answer for any game
 */
export const validateAnswer = async (gameName, userAnswer, gameData) => {
  const game = await getGame(gameName);
  return game.validateAnswer(userAnswer, gameData);
};

/**
 * Calculate score for any game
 */
export const calculateScore = async (gameName, results) => {
  const game = await getGame(gameName);
  return game.calculateScore(results);
};

export default {
  getGame,
  generateGameData,
  validateAnswer,
  calculateScore,
  games
};
