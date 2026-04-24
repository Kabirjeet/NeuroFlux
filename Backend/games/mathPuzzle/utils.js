/**
 * MathPuzzle Game Utilities
 * Updated for GameManager interface
 */

// Existing utilities
export const generateMultiStepPuzzle = () => {
  const steps = [
    { equation: '20 / 4', expected: 5 },
    { equation: '5 + 3', expected: 8 },
    { equation: '8 * 2', expected: 16 }
  ];
  return steps;
};

export const solveStep = (equation) => {
  try {
    return eval(equation);
  } catch {
    return null;
  }
};

export const getPuzzleScore = (attempts) => {
  return attempts.reduce((score, attempt) => score + (attempt.correct ? 10 : 0), 0);
};

// GameManager interface
export const generateGameData = () => {
  const steps = generateMultiStepPuzzle();
  return {
    id: Date.now(),
    type: 'mathPuzzle',
    steps,
    totalSteps: steps.length
  };
};

export const validateAnswer = (userAnswers, gameData) => {
  return userAnswers.every((answer, index) => {
    return Math.abs(answer - gameData.steps[index].expected) < 0.1;
  });
};

export const calculateScore = (results) => {
  return getPuzzleScore(results.attempts || []);
};

// Export for GameManager
export default {
  generateGameData,
  validateAnswer,
  calculateScore
};

