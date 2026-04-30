/**
 * MemoryMatrix Game Utilities
 * GameManager contract: generateGameData(), validateAnswer(), calculateScore()
 */

const DEFAULT_TIME_LIMIT = 15;
const POINTS_PER_QUESTION = 100;
const DEFAULT_SIZE = 4;
const ROUND_COUNT = 5;

const hashSeed = (value = 'memoryMatrix') => {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const seededRandom = (seed) => {
  let state = seed || 1;
  return () => {
    state = Math.imul(1103515245, state) + 12345;
    return ((state >>> 16) & 0x7fff) / 0x8000;
  };
};

export const generateMatrixPattern = (size = DEFAULT_SIZE, seed = 'memoryMatrix', round = 0) => {
  const random = seededRandom(hashSeed(`${seed}:${round}`));
  const positions = [];
  const count = 2 + (round % 3);

  while (positions.length < count) {
    const row = Math.floor(random() * size);
    const col = Math.floor(random() * size);
    if (!positions.some((position) => position.row === row && position.col === col)) {
      positions.push({ row, col });
    }
  }

  return { size, pattern: positions, showTime: 3000 };
};

const normalizePositions = (positions = []) => {
  return positions
    .map((position) => `${Number(position.row)},${Number(position.col)}`)
    .sort();
};

export const checkMatrixGuess = (guess, pattern) => {
  const normalizedGuess = normalizePositions(guess);
  const normalizedPattern = normalizePositions(pattern);

  return normalizedGuess.length === normalizedPattern.length &&
    normalizedGuess.every((position, index) => position === normalizedPattern[index]);
};

const normalizeGuess = (userAnswer) => userAnswer?.positions || userAnswer?.guess || userAnswer?.answer || userAnswer || [];

export const generateGameData = ({ roomId } = {}) => {
  const questions = Array.from({ length: ROUND_COUNT }, (_, index) => {
    const matrixData = generateMatrixPattern(DEFAULT_SIZE, roomId || 'memoryMatrix', index);
    return {
      id: `memory-${index + 1}`,
      prompt: 'Repeat the highlighted pattern.',
      round: index + 1,
      size: matrixData.size,
      pattern: matrixData.pattern,
      showTime: matrixData.showTime,
      maxScore: POINTS_PER_QUESTION
    };
  });

  return {
    id: `memoryMatrix_${roomId || 'default'}`,
    type: 'memoryMatrix',
    currentQuestionIndex: 0,
    timeLimit: DEFAULT_TIME_LIMIT,
    totalQuestions: questions.length,
    questions,
    size: DEFAULT_SIZE,
    pattern: questions[0].pattern,
    showTime: questions[0].showTime,
    maxScore: POINTS_PER_QUESTION
  };
};

export const validateAnswer = (userAnswer, gameData) => {
  const questionIndex = gameData.currentQuestionIndex || 0;
  const question = gameData.questions[questionIndex];
  const submittedGuess = normalizeGuess(userAnswer);
  const correctMatches = normalizePositions(submittedGuess)
    .filter((position) => normalizePositions(question.pattern).includes(position)).length;
  const isCorrect = checkMatrixGuess(submittedGuess, question.pattern);

  return {
    isCorrect,
    correct: isCorrect,
    score: isCorrect ? POINTS_PER_QUESTION : 0,
    questionIndex,
    correctMatches,
    patternLength: question.pattern.length,
    maxScore: POINTS_PER_QUESTION
  };
};

export const calculateScore = (results = []) => {
  const normalizedResults = Array.isArray(results) ? results : [results];
  return normalizedResults.reduce((total, result) => total + (Number(result?.score) || 0), 0);
};

export default {
  generateGameData,
  validateAnswer,
  calculateScore
};
