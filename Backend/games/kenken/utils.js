/**
 * KenKen Game Utilities
 * GameManager contract: generateGameData(), validateAnswer(), calculateScore()
 */

const DEFAULT_TIME_LIMIT = 15;
const POINTS_PER_QUESTION = 100;
const SIZE = 4;

const SOLUTIONS = [
  [
    [2, 4, 1, 3],
    [1, 3, 4, 2],
    [4, 2, 3, 1],
    [3, 1, 2, 4]
  ],
  [
    [1, 3, 4, 2],
    [4, 2, 1, 3],
    [2, 4, 3, 1],
    [3, 1, 2, 4]
  ],
  [
    [3, 1, 2, 4],
    [2, 4, 1, 3],
    [4, 2, 3, 1],
    [1, 3, 4, 2]
  ]
];

const CAGES = [
  [
    { cells: [[0, 0], [0, 1]], target: 8, operator: '*' },
    { cells: [[0, 2], [1, 2]], target: 4, operator: '*' },
    { cells: [[0, 3], [1, 3]], target: 1, operator: '-' },
    { cells: [[1, 0], [2, 0]], target: 3, operator: '+' },
    { cells: [[1, 1], [2, 1]], target: 1, operator: '-' },
    { cells: [[2, 2], [2, 3]], target: 3, operator: '-' },
    { cells: [[3, 0], [3, 1]], target: 3, operator: '-' },
    { cells: [[3, 2], [3, 3]], target: 8, operator: '*' }
  ],
  [
    { cells: [[0, 0], [1, 0]], target: 4, operator: '*' },
    { cells: [[0, 1], [0, 2]], target: 1, operator: '-' },
    { cells: [[0, 3], [1, 3]], target: 1, operator: '-' },
    { cells: [[1, 1], [1, 2]], target: 2, operator: '-' },
    { cells: [[2, 0], [2, 1]], target: 8, operator: '*' },
    { cells: [[2, 2], [2, 3]], target: 2, operator: '+' },
    { cells: [[3, 0], [3, 1]], target: 4, operator: '+' },
    { cells: [[3, 2], [3, 3]], target: 8, operator: '*' }
  ],
  [
    { cells: [[0, 0], [1, 0]], target: 1, operator: '-' },
    { cells: [[0, 1], [1, 1]], target: 4, operator: '*' },
    { cells: [[0, 2], [0, 3]], target: 8, operator: '*' },
    { cells: [[1, 2], [1, 3]], target: 2, operator: '+' },
    { cells: [[2, 0], [2, 1]], target: 2, operator: '-' },
    { cells: [[2, 2], [2, 3]], target: 2, operator: '+' },
    { cells: [[3, 0], [3, 1]], target: 4, operator: '+' },
    { cells: [[3, 2], [3, 3]], target: 8, operator: '*' }
  ]
];

const hashSeed = (value = 'kenken') => {
  let hash = 0;
  for (const char of String(value)) {
    hash = Math.imul(31, hash) + char.charCodeAt(0);
  }
  return Math.abs(hash);
};

const emptyGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const normalizeGrid = (userAnswer) => userAnswer?.grid || userAnswer?.answer || userAnswer;

export const generateKenkenGrid = () => emptyGrid();

export const validateKenkenMove = (grid, row, col, value) => {
  if (!Array.isArray(grid) || value < 1 || value > SIZE) return false;
  const rowValues = grid[row].filter((_, index) => index !== col);
  const colValues = grid.map((currentRow) => currentRow[col]).filter((_, index) => index !== row);
  return !rowValues.includes(value) && !colValues.includes(value);
};

export const checkKenkenComplete = (grid) => {
  return Array.isArray(grid) && grid.every((row) => row.every((cell) => cell > 0));
};

export const generateGameData = ({ roomId } = {}) => {
  const puzzleIndex = hashSeed(roomId || 'kenken') % SOLUTIONS.length;
  const solution = SOLUTIONS[puzzleIndex];
  const grid = emptyGrid();
  const question = {
    id: `kenken-${puzzleIndex + 1}`,
    prompt: 'Complete the KenKen grid.',
    grid,
    size: SIZE,
    cages: CAGES[puzzleIndex],
    maxScore: POINTS_PER_QUESTION
  };

  return {
    id: `kenken_${roomId || 'default'}`,
    type: 'kenken',
    currentQuestionIndex: 0,
    timeLimit: DEFAULT_TIME_LIMIT,
    totalQuestions: 1,
    questions: [question],
    grid,
    size: SIZE,
    cages: CAGES[puzzleIndex],
    solution
  };
};

export const validateAnswer = (userAnswer, gameData) => {
  const userGrid = normalizeGrid(userAnswer);
  const questionIndex = gameData.currentQuestionIndex || 0;
  const solution = gameData.solution;
  const isCorrect = Array.isArray(userGrid) &&
    solution.every((row, rowIndex) =>
      row.every((cell, colIndex) => Number(userGrid[rowIndex]?.[colIndex]) === cell)
    );

  return {
    isCorrect,
    correct: isCorrect,
    score: isCorrect ? POINTS_PER_QUESTION : 0,
    questionIndex,
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
