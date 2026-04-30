/**
 * MathPuzzle Game Utilities
 * GameManager contract: generateGameData(), validateAnswer(), calculateScore()
 */

const DEFAULT_TIME_LIMIT = 15;
const POINTS_PER_QUESTION = 100;

const PUZZLES = [
  [
    { id: 'math-1-1', equation: '20 / 4', expected: 5 },
    { id: 'math-1-2', equation: '5 + 3', expected: 8 },
    { id: 'math-1-3', equation: '8 * 2', expected: 16 }
  ],
  [
    { id: 'math-2-1', equation: '12 + 6', expected: 18 },
    { id: 'math-2-2', equation: '18 / 3', expected: 6 },
    { id: 'math-2-3', equation: '6 * 7', expected: 42 }
  ],
  [
    { id: 'math-3-1', equation: '9 * 4', expected: 36 },
    { id: 'math-3-2', equation: '36 - 11', expected: 25 },
    { id: 'math-3-3', equation: '25 / 5', expected: 5 }
  ]
];

const hashSeed = (value = 'mathPuzzle') => {
  let hash = 5381;
  for (const char of String(value)) {
    hash = ((hash << 5) + hash) + char.charCodeAt(0);
  }
  return Math.abs(hash);
};

const normalizeAnswer = (userAnswer) => {
  const answer = userAnswer?.answer ?? userAnswer?.value ?? userAnswer;
  return Number(answer);
};

export const generateMultiStepPuzzle = (seed = 'mathPuzzle') => {
  return PUZZLES[hashSeed(seed) % PUZZLES.length];
};

export const solveStep = (equation) => {
  const match = String(equation).match(/^\s*(-?\d+(?:\.\d+)?)\s*([+\-*/])\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;

  const left = Number(match[1]);
  const operator = match[2];
  const right = Number(match[3]);

  if (operator === '+') return left + right;
  if (operator === '-') return left - right;
  if (operator === '*') return left * right;
  if (operator === '/') return right === 0 ? null : left / right;
  return null;
};

export const getPuzzleScore = (attempts = []) => {
  return attempts.reduce((score, attempt) => score + (attempt.correct || attempt.isCorrect ? POINTS_PER_QUESTION : 0), 0);
};

export const generateGameData = ({ roomId } = {}) => {
  const steps = generateMultiStepPuzzle(roomId || 'mathPuzzle').map((step, index) => ({
    ...step,
    prompt: `Solve: ${step.equation}`,
    round: index + 1,
    maxScore: POINTS_PER_QUESTION
  }));

  return {
    id: `mathPuzzle_${roomId || 'default'}`,
    type: 'mathPuzzle',
    currentQuestionIndex: 0,
    timeLimit: DEFAULT_TIME_LIMIT,
    totalQuestions: steps.length,
    questions: steps,
    steps,
    totalSteps: steps.length
  };
};

export const validateAnswer = (userAnswer, gameData) => {
  const questionIndex = gameData.currentQuestionIndex || 0;
  const currentStep = gameData.questions[questionIndex] || gameData.steps[questionIndex];
  const submittedAnswer = normalizeAnswer(userAnswer);
  const isCorrect = Number.isFinite(submittedAnswer) && Math.abs(submittedAnswer - currentStep.expected) < 0.1;

  return {
    isCorrect,
    correct: isCorrect,
    score: isCorrect ? POINTS_PER_QUESTION : 0,
    questionIndex,
    submittedAnswer,
    correctAnswer: currentStep.expected,
    maxScore: POINTS_PER_QUESTION
  };
};

export const calculateScore = (results = []) => {
  const normalizedResults = Array.isArray(results) ? results : (results.attempts || [results]);
  return getPuzzleScore(normalizedResults);
};

export default {
  generateGameData,
  validateAnswer,
  calculateScore
};
