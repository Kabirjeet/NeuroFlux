/**
 * Math Puzzle Race Backend Logic
 * Generate same problems for duel, time scoring
 */

const OPS = ['+', '-', '*', '/'];
const NUM_RANGE_EASY = { min: 1, max: 10 };
const NUM_RANGE_MED = { min: 5, max: 20 };
const NUM_RANGE_HARD = { min: 10, max: 50 };

/**
 * generateProblems(levels = ['easy', 'medium', 'hard'], count = 10)
 * Returns identical problems for both players
 */
export const generateProblems = (difficulty = 'medium', count = 10) => {
  const range = {
    easy: NUM_RANGE_EASY,
    medium: NUM_RANGE_MED,
    hard: NUM_RANGE_HARD
  }[difficulty] || NUM_RANGE_MED;

  const problems = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const b = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const op = OPS[Math.floor(Math.random() * OPS.length)];
    let expected;
    
    switch (op) {
      case '+': expected = a + b; break;
      case '-': expected = a - b; break;
      case '*': expected = a * b; break;
      case '/': 
        expected = b !== 0 ? Math.floor(a / b) : 0; 
        break;
      default: expected = 0;
    }

    problems.push({
      id: i,
      equation: `${a} ${op} ${b}`,
      expected: Math.round(expected * 100) / 100, // Precision
      difficulty
    });
  }
  
  return {
    problems,
    total: count,
    startTime: Date.now(),
    difficulty
  };
};

/**
 * validateAnswer(problemId, userAnswer, session)
 * Returns {correct: bool, timeBonus: number}
 */
export const validateAnswer = (problemId, userAnswer, session) => {
  const problem = session.problems.find(p => p.id === problemId);
  if (!problem) return { correct: false, timeBonus: 0 };

  const correct = Math.abs(userAnswer - problem.expected) < 0.01;
  const timeElapsed = (Date.now() - session.startTime) / 1000;
  const timeBonus = correct ? Math.max(0, 100 - timeElapsed * 0.5) : 0;

  return {
    correct,
    timeBonus,
    score: correct ? 10 + timeBonus : 0
  };
};

/**
 * getRaceScore(sessionResults)
 */
export const getRaceScore = (sessionResults) => {
  return sessionResults.reduce((total, result) => total + result.score, 0);
};

// Demo
if (require.main === module) {
  console.log('Demo:');
  const session = generateProblems('hard', 3);
  console.log(session.problems);
  console.log(validateAnswer(0, session.problems[0].expected, session));
}

export default {
  generateProblems,
  validateAnswer,
  getRaceScore
};

