/**
 * MindSnap Game Utilities
 * Updated for GameManager interface
 */

// Mock MCQ questions for Mind Snap Duel (10 questions)
export const mockMCQQuestions = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: {
      A: "London",
      B: "Berlin",
      C: "Paris",
      D: "Madrid"
    },
    correct: "C"
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: {
      A: "Venus",
      B: "Mars",
      C: "Jupiter",
      D: "Saturn"
    },
    correct: "B"
  },
  {
    id: 3,
    question: "What is 15 * 3?",
    options: {
      A: "30",
      B: "40",
      C: "45",
      D: "50"
    },
    correct: "C"
  },
  {
    id: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    options: {
      A: "Charles Dickens",
      B: "William Shakespeare",
      C: "Jane Austen",
      D: "Mark Twain"
    },
    correct: "B"
  },
  {
    id: 5,
    question: "What is the largest ocean on Earth?",
    options: {
      A: "Atlantic",
      B: "Indian",
      C: "Arctic",
      D: "Pacific"
    },
    correct: "D"
  },
  {
    id: 6,
    question: "Which element has the symbol 'O'?",
    options: {
      A: "Gold",
      B: "Oxygen",
      C: "Osmium",
      D: "Oganesson"
    },
    correct: "B"
  },
  {
    id: 7,
    question: "What is the speed of light (approx)?",
    options: {
      A: "300,000 km/s",
      B: "150,000 km/s",
      C: "500,000 km/s",
      D: "1,000 km/s"
    },
    correct: "A"
  },
  {
    id: 8,
    question: "Which country hosted the 2024 Olympics?",
    options: {
      A: "USA",
      B: "Japan",
      C: "France",
      D: "UK"
    },
    correct: "C"
  },
  {
    id: 9,
    question: "What does HTTP stand for?",
    options: {
      A: "Hyper Text Transfer Protocol",
      B: "High Tech Transfer Process",
      C: "Hyper Transfer Text Processor",
      D: "Home Tool Transport Protocol"
    },
    correct: "A"
  },
  {
    id: 10,
    question: "Which is the smallest prime number?",
    options: {
      A: "1",
      B: "2",
      C: "3",
      D: "5"
    },
    correct: "B"
  }
];

export const generateQuestions = () => {
  // Shuffle and take 10 for variety (mock - always same set shuffled)
  const shuffled = [...mockMCQQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
};



export const validateAnswer = (userAnswer, gameData) => {
  const currentQuestion = gameData.questions[gameData.currentQuestionIndex];
  return userAnswer === currentQuestion.correct;
};

// GameManager interface
export const generateGameData = () => {
  return {
    id: Date.now(),
    type: 'mindSnapDuel',
    questions: generateQuestions(),
    currentQuestionIndex: 0,
    timeLimit: 10
  };
};

export const calculateScore = (results) => {
  // results: [{correct: boolean, timeTaken: number (seconds)}]
  // Score per question: 100 for correct + speed bonus (max 50 if <2s)
  return results.reduce((total, result) => {
    if (!result.correct) return total;
    const speedBonus = Math.max(0, 50 - (result.timeTaken * 5)); // 10s max -> 0 bonus, 0s -> 50 bonus
    return total + 100 + speedBonus;
  }, 0);
};

// Export for GameManager
export default {
  generateGameData,
  validateAnswer: (userAnswer, gameData) => validateAnswer(userAnswer, gameData),
  calculateScore
};

