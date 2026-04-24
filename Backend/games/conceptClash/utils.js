/**
 * Concept Clash - Term-Definition Matching Game
 * Backend logic for PDF/document-based memory matching
 */

import * as geminiService from '../../utils/geminiService.js';

const NUM_PAIRS = 10;

const SAMPLE_TEXT = `React is a JavaScript library for building user interfaces.
Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine for server-side.
Mongoose is an Object Document Mapper (ODM) for MongoDB.
Primary key is a unique identifier for database records.
Gemini is Google's multimodal AI model family.
Socket.IO is a library for low-latency bidirectional communication.`;

function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * extractConcepts(text) - Extract term-definition pairs from full document chunks text
 */
export const extractConcepts = async (text) => {
  const concepts = await geminiService.extractTermDefinitionPairs(text, NUM_PAIRS);
  if (concepts.length < NUM_PAIRS / 2) {
    throw new Error(`Insufficient concepts extracted: ${concepts.length}`);
  }
  return concepts;
};

/**
 * generatePairs() - Shuffle terms and definitions for matching game
 */
export const generatePairs = (concepts) => {
  const terms = concepts.map(p => p.term);
  const definitions = concepts.map(p => p.definition);
  return {
    pairs: concepts, // original for validation
    shuffledTerms: shuffle(terms),
    shuffledDefinitions: shuffle(definitions),
    numPairs: concepts.length
  };
};

/**
 * validateMatch(userMatches, gameData) - Validate player term->def mappings
 * userMatches: [{termIndex: number, defIndex: number}, ...]
 */
export const validateMatch = (userMatches, gameData) => {
  const validationResults = userMatches.map((match, index) => {
    const termIndex = match.termIndex;
    const defIndex = match.defIndex;
    const term = gameData.shuffledTerms[termIndex];
    const submittedDefinition = gameData.shuffledDefinitions[defIndex];
    
    // Find the original pair for this term
    const originalPair = gameData.pairs.find(p => p.term === term);
    const isCorrect = originalPair && originalPair.definition === submittedDefinition;
    
    return {
      termIndex,
      defIndex,
      term,
      submittedDefinition,
      originalDefinition: originalPair?.definition,
      isCorrect
    };
  });

  const correctCount = validationResults.filter(r => r.isCorrect).length;
  const total = gameData.numPairs;
  const percentage = Math.round((correctCount / total) * 100);

  return {
    correctCount,
    total,
    percentage,
    score: percentage * 10, // Max 1000 for 10 pairs
    results: validationResults,
    completed: userMatches.length === total
  };
};

/**
 * GameManager interface - generateGameData(docText?)
 */
export const generateGameData = async (docText) => {
  const text = docText || SAMPLE_TEXT;
  const concepts = await extractConcepts(text);
  const pairsGame = generatePairs(concepts);
  return {
    id: Date.now(),
    type: 'conceptClash',
    ...pairsGame,
    round: 1,
    totalRounds: 1,
    timeLimit: 45,
    instructions: 'Match each term to its definition!'
  };
};

/**
 * For GameManager compatibility
 */
export const validateAnswer = (userAnswer, gameData) => {
  return validateMatch(userAnswer.matches || userAnswer, gameData);
};

export const calculateScore = (gameResults) => {
  // gameResults: array of validateMatch results
  return gameResults.reduce((sum, result) => sum + result.score, 0);
};

export default {
  generateGameData,
  validateAnswer,
  calculateScore
};
