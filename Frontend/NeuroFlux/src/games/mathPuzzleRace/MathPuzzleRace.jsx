import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../common/MultiplayerManager';

// Mock backend
const generateProblems = (difficulty = 'medium', count = 10) => ({
  problems: [
    {id: 0, equation: '12 + 8', expected: 20},
    {id: 1, equation: '25 - 17', expected: 8},
    {id: 2, equation: '6 * 7', expected: 42},
    {id: 3, equation: '48 / 6', expected: 8},
    {id: 4, equation: '15 + 9 * 2', expected: 33},
    // More...
  ].slice(0, count),
  total: count,
  startTime: Date.now(),
  difficulty
});

const validateAnswer = (problemId, userAnswer, session) => {
  const problem = session.problems.find(p => p.id === problemId);
  const correct = Math.abs(userAnswer - problem.expected) < 0.01;
  return { correct, score: correct ? 10 : 0 };
};

const MathPuzzleRace = ({ opponentProgress = 0, opponentScore = 180 }) => {
  const { selectGame } = useMultiplayer();

  useEffect(() => {
    selectGame('mathPuzzle');
  }, [selectGame]);
  const [session, setSession] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timer, setTimer] = useState(90); // Per problem
  const [userScore, setUserScore] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    const init = () => {
      const newSession = generateProblems('medium', 15);
      setSession(newSession);
    };
    init();
  }, []);

  useEffect(() => {
    if (!gameActive || timer <= 0) return;
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [gameActive, timer]);

  const handleSubmit = () => {
    if (!session) return;
    
    const result = validateAnswer(currentProblem, parseFloat(answer), session);
    if (result.correct) {
      setUserScore(s => s + result.score + (correctStreak * 2));
      setCorrectStreak(s => s + 1);
      nextProblem();
    } else {
      setCorrectStreak(0);
    }
    setAnswer('');
    setTimer(90);
  };

  const nextProblem = () => {
    if (currentProblem + 1 < session.total) {
      setCurrentProblem(p => p + 1);
    } else {
      setGameActive(false);
    }
  };

  const problem = session?.problems[currentProblem];

  if (!session || !problem) {
    return <div className="flex items-center justify-center h-screen text-white text-2xl">Loading race...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
            ⚡ Math Puzzle Race
          </h1>
          
          <div className="flex items-center gap-8">
            <div>
              <div className="text-2xl font-bold text-emerald-400 mb-1">You: {userScore}</div>
              <div className="text-lg text-purple-300">Streak: {correctStreak}</div>
            </div>
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex flex-col items-center justify-center text-xl font-bold shadow-2xl">
              <div>{opponentScore}</div>
              <div className="text-xs opacity-75">Opp</div>
            </div>
            <div className={`px-6 py-3 rounded-2xl font-mono font-bold text-xl border-4 shadow-lg ${
              timer <= 10 ? 'bg-red-500/30 text-red-300 border-red-400 animate-pulse' : 'bg-emerald-500/30 text-emerald-300 border-emerald-400'
            }`}>
              {timer}s
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-4 mb-12">
          <div className="flex-1 bg-gray-800 rounded-xl p-2">
            <div className="text-xs text-gray-400 mb-1">Your Progress</div>
            <div className="bg-purple-500 h-3 rounded-lg animate-pulse" style={{width: `${Math.min(100, (currentProblem / session.total) * 100)}%`}}></div>
          </div>
          <div className="flex-1 bg-gray-800 rounded-xl p-2">
            <div className="text-xs text-gray-400 mb-1">Opponent</div>
            <div className="bg-orange-500 h-3 rounded-lg" style={{width: `${opponentProgress}%`}}></div>
          </div>
        </div>

        {/* Current Problem */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 mb-12 text-center shadow-2xl">
          <div className="text-5xl md:text-6xl font-mono font-bold text-white mb-8 tracking-wider">
            {problem.equation}
            <span className="text-4xl text-purple-400 ml-4">=</span>
          </div>
          
          <div className="flex gap-4 justify-center items-center">
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-32 p-6 text-3xl font-bold text-center rounded-2xl border-4 border-purple-400 bg-white/20 backdrop-blur-sm focus:border-purple-300 focus:outline-none focus:shadow-purple-500/25 transition-all text-purple-900"
              placeholder="?"
              disabled={!gameActive}
            />
            <button
              onClick={handleSubmit}
              disabled={!answer || !gameActive}
              className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter
            </button>
          </div>

          <div className="mt-8 text-lg opacity-75">
            Problem {currentProblem + 1} / {session.total}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-gray-400 text-center text-sm max-w-md mx-auto">
          Answer fast to beat opponent! Same problems for fair race.
        </div>
      </div>
    </div>
  );
};

export default MathPuzzleRace;

