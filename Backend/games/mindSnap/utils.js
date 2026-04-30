/**
 * MindSnap Game Utilities
 * GameManager contract: generateGameData(), validateAnswer(), calculateScore()
 */

const DEFAULT_TIME_LIMIT = 15;
const POINTS_PER_QUESTION = 100;

export const mockMCQQuestions = [
  {
    id: 'mindSnap-1',
    question: 'What is the capital of France?',
    options: { A: 'London', B: 'Berlin', C: 'Paris', D: 'Madrid' },
    correct: 'C'
  },
  {
    id: 'mindSnap-2',
    question: 'Which planet is known as the Red Planet?',
    options: { A: 'Venus', B: 'Mars', C: 'Jupiter', D: 'Saturn' },
    correct: 'B'
  },
  {
    id: 'mindSnap-3',
    question: 'What is 15 * 3?',
    options: { A: '30', B: '40', C: '45', D: '50' },
    correct: 'C'
  },
  {
    id: 'mindSnap-4',
    question: "Who wrote 'Romeo and Juliet'?",
    options: { A: 'Charles Dickens', B: 'William Shakespeare', C: 'Jane Austen', D: 'Mark Twain' },
    correct: 'B'
  },
  {
    id: 'mindSnap-5',
    question: 'What is the largest ocean on Earth?',
    options: { A: 'Atlantic', B: 'Indian', C: 'Arctic', D: 'Pacific' },
    correct: 'D'
  },
  {
    id: 'mindSnap-6',
    question: "Which element has the symbol 'O'?",
    options: { A: 'Gold', B: 'Oxygen', C: 'Osmium', D: 'Oganesson' },
    correct: 'B'
  },
  {
    id: 'mindSnap-7',
    question: 'What is the speed of light, approximately?',
    options: { A: '300,000 km/s', B: '150,000 km/s', C: '500,000 km/s', D: '1,000 km/s' },
    correct: 'A'
  },
  {
    id: 'mindSnap-8',
    question: 'Which country hosted the 2024 Olympics?',
    options: { A: 'USA', B: 'Japan', C: 'France', D: 'UK' },
    correct: 'C'
  },
  {
    id: 'mindSnap-9',
    question: 'What does HTTP stand for?',
    options: {
      A: 'Hyper Text Transfer Protocol',
      B: 'High Tech Transfer Process',
      C: 'Hyper Transfer Text Processor',
      D: 'Home Tool Transport Protocol'
    },
    correct: 'A'
  },
  {
    id: 'mindSnap-10',
    question: 'Which is the smallest prime number?',
    options: { A: '1', B: '2', C: '3', D: '5' },
    correct: 'B'
  }
];

const hashSeed = (value = 'mindSnap') => {
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
    state = Math.imul(1664525, state) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
};

const shuffle = (items, seed) => {
  const random = seededRandom(seed);
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getCurrentQuestion = (gameData) => {
  const questionIndex = gameData.currentQuestionIndex || 0;
  return {
    questionIndex,
    question: gameData.questions[questionIndex]
  };
};

const normalizeAnswer = (userAnswer) => {
  const answer = userAnswer?.answer ?? userAnswer?.selectedOption ?? userAnswer;
  if (typeof answer === 'number') return ['A', 'B', 'C', 'D'][answer] || String(answer);
  return String(answer || '').trim().toUpperCase();
};

export const generateQuestions = (seed = 'mindSnap') => {
  return shuffle(mockMCQQuestions, hashSeed(seed)).map((question, index) => ({
    ...question,
    round: index + 1,
    maxScore: POINTS_PER_QUESTION
  }));
};

export const generateGameData = ({ roomId } = {}) => {
  const questions = generateQuestions(roomId || 'mindSnap');
  return {
    id: `mindSnap_${roomId || 'default'}`,
    type: 'mindSnap',
    currentQuestionIndex: 0,
    timeLimit: DEFAULT_TIME_LIMIT,
    totalQuestions: questions.length,
    questions
  };
};

export const validateAnswer = (userAnswer, gameData) => {
  const { questionIndex, question } = getCurrentQuestion(gameData);
  const normalizedAnswer = normalizeAnswer(userAnswer);
  const isCorrect = normalizedAnswer === question.correct;

  return {
    isCorrect,
    correct: isCorrect,
    score: isCorrect ? POINTS_PER_QUESTION : 0,
    questionIndex,
    submittedAnswer: normalizedAnswer,
    correctAnswer: question.correct,
    maxScore: POINTS_PER_QUESTION
  };
};

export const calculateScore = (results = []) => {
  const normalizedResults = Array.isArray(results) ? results : [results];
  return normalizedResults.reduce((total, result) => {
    if (Number.isFinite(result?.score)) return total + result.score;
    return total + (result?.isCorrect || result?.correct ? POINTS_PER_QUESTION : 0);
  }, 0);
};

export default {
  generateGameData,
  validateAnswer,
  calculateScore
};
