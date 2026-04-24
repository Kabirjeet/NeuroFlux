/**
 * MemoryMatrix Game Utilities
 * Updated for GameManager interface
 */

// Existing utilities
export const generateMatrixPattern = (size = 4) => {
  const positions = [];
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 lit positions
  
  while (positions.length < count) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (!positions.some(p => p.row === row && p.col === col)) {
      positions.push({ row, col });
    }
  }
  
  return { size, pattern: positions, showTime: 3000 };
};

export const checkMatrixGuess = (guess, pattern) => {
  return guess.length === pattern.length && 
         guess.every((pos, i) => pos.row === pattern[i].row && pos.col === pattern[i].col);
};

// GameManager interface
export const generateGameData = () => {
  const matrixData = generateMatrixPattern();
  return {
    id: Date.now(),
    type: 'memoryMatrix',
    size: matrixData.size,
    pattern: matrixData.pattern, // Shown briefly then hidden
    showTime: matrixData.showTime,
    maxScore: 100
  };
};

export const validateAnswer = (userGuess, gameData) => {
  return checkMatrixGuess(userGuess, gameData.pattern);
};

export const calculateScore = (results) => {
  // results: {attempts: number, patternLength: number}
  const accuracy = results.correctMatches / results.patternLength;
  return Math.floor(accuracy * 100);
};

// Export for GameManager
export default {
  generateGameData,
  validateAnswer,
  calculateScore
};

