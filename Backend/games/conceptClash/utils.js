/**
 * ConceptClash Game Utilities
 * GameManager contract: generateGameData(), validateAnswer(), calculateScore()
 */

const NUM_PAIRS = 10;
const DEFAULT_TIME_LIMIT = 15;
const POINTS_PER_QUESTION = 100;

const SAMPLE_CONCEPTS = [
  {
    term: 'React',
    definition: 'A JavaScript library for building user interfaces.'
  },
  {
    term: 'Node.js',
    definition: "A JavaScript runtime built on Chrome's V8 engine for server-side applications."
  },
  {
    term: 'Mongoose',
    definition: 'An Object Document Mapper for MongoDB.'
  },
  {
    term: 'Primary key',
    definition: 'A unique identifier for database records.'
  },
  {
    term: 'Gemini',
    definition: "Google's multimodal AI model family."
  },
  {
    term: 'Socket.IO',
    definition: 'A library for low-latency bidirectional communication.'
  },
  {
    term: 'JWT',
    definition: 'A compact token format commonly used for stateless authentication.'
  },
  {
    term: 'MongoDB',
    definition: 'A document database that stores data as flexible JSON-like documents.'
  },
  {
    term: 'Express',
    definition: 'A web framework for building Node.js APIs and servers.'
  },
  {
    term: 'CORS',
    definition: 'A browser security mechanism that controls cross-origin HTTP requests.'
  }
];

const SAMPLE_TEXT = SAMPLE_CONCEPTS
  .map((concept) => `${concept.term}: ${concept.definition}`)
  .join('\n');

const hashSeed = (value = 'conceptClash') => {
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

function shuffle(array, seed) {
  const random = seededRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const parseConceptsFromText = (text) => {
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return null;

      const term = line.slice(0, separatorIndex).trim();
      const definition = line.slice(separatorIndex + 1).trim();

      return term && definition ? { term, definition } : null;
    })
    .filter(Boolean);
};

/**
 * Extract term-definition pairs from text.
 * The multiplayer path falls back to deterministic local pairs if AI extraction is unavailable.
 */
export const extractConcepts = async (text = SAMPLE_TEXT) => {
  const localConcepts = parseConceptsFromText(text);
  if (localConcepts.length >= NUM_PAIRS / 2) return localConcepts.slice(0, NUM_PAIRS);

  try {
    const geminiService = await import('../../utils/geminiService.js');
    const concepts = await geminiService.extractTermDefinitionPairs(text, NUM_PAIRS);
    if (concepts.length >= NUM_PAIRS / 2) return concepts.slice(0, NUM_PAIRS);
  } catch (error) {
    console.warn('ConceptClash AI extraction unavailable, using sample concepts:', error.message);
  }

  return SAMPLE_CONCEPTS;
};

export const generatePairs = (concepts, seed = 'conceptClash') => {
  const normalizedConcepts = concepts.slice(0, NUM_PAIRS);
  const terms = normalizedConcepts.map((pair) => pair.term);
  const definitions = normalizedConcepts.map((pair) => pair.definition);
  const baseSeed = hashSeed(seed);

  return {
    pairs: normalizedConcepts,
    shuffledTerms: shuffle(terms, baseSeed),
    shuffledDefinitions: shuffle(definitions, baseSeed ^ 0x9e3779b9),
    numPairs: normalizedConcepts.length
  };
};

const normalizeMatches = (userAnswer) => {
  const matches = userAnswer?.matches || userAnswer?.answer || userAnswer;
  if (Array.isArray(matches)) return matches;
  if (!matches || typeof matches !== 'object') return [];

  return Object.entries(matches).map(([termIndex, defIndex]) => ({
    termIndex: Number(termIndex),
    defIndex: Number(defIndex)
  }));
};

export const validateMatch = (userMatches, gameData) => {
  const matches = normalizeMatches(userMatches);
  const validationResults = matches.map((match) => {
    const termIndex = Number(match.termIndex);
    const defIndex = Number(match.defIndex);
    const term = gameData.shuffledTerms[termIndex];
    const submittedDefinition = gameData.shuffledDefinitions[defIndex];
    const originalPair = gameData.pairs.find((pair) => pair.term === term);
    const isCorrect = Boolean(originalPair && originalPair.definition === submittedDefinition);

    return {
      termIndex,
      defIndex,
      term,
      submittedDefinition,
      originalDefinition: originalPair?.definition,
      isCorrect
    };
  });

  const correctCount = validationResults.filter((result) => result.isCorrect).length;
  const total = gameData.numPairs || gameData.pairs.length;
  const isCorrect = total > 0 && correctCount === total && matches.length === total;

  return {
    isCorrect,
    correct: isCorrect,
    score: isCorrect ? POINTS_PER_QUESTION : Math.round((correctCount / total) * POINTS_PER_QUESTION),
    questionIndex: gameData.currentQuestionIndex || 0,
    correctCount,
    total,
    results: validationResults,
    maxScore: POINTS_PER_QUESTION
  };
};

export const generateGameData = async ({ roomId, text } = {}) => {
  const concepts = text ? await extractConcepts(text) : SAMPLE_CONCEPTS;
  const pairData = generatePairs(concepts, roomId || 'conceptClash');
  const question = {
    id: 'conceptClash-1',
    prompt: 'Match each term to its definition.',
    shuffledTerms: pairData.shuffledTerms,
    shuffledDefinitions: pairData.shuffledDefinitions,
    numPairs: pairData.numPairs,
    maxScore: POINTS_PER_QUESTION
  };

  return {
    id: `conceptClash_${roomId || 'default'}`,
    type: 'conceptClash',
    currentQuestionIndex: 0,
    timeLimit: DEFAULT_TIME_LIMIT,
    totalQuestions: 1,
    questions: [question],
    ...pairData,
    round: 1,
    totalRounds: 1,
    instructions: 'Match each term to its definition!'
  };
};

export const validateAnswer = (userAnswer, gameData) => {
  return validateMatch(userAnswer, gameData);
};

export const calculateScore = (results = []) => {
  const normalizedResults = Array.isArray(results) ? results : [results];
  return normalizedResults.reduce((sum, result) => sum + (Number(result?.score) || 0), 0);
};

export default {
  generateGameData,
  validateAnswer,
  calculateScore
};
