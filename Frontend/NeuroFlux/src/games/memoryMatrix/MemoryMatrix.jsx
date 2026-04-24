import React, { useState, useEffect, useCallback } from 'react';
import { useMultiplayer } from '../common/MultiplayerManager';
import { Button } from '../../components/common/Button.jsx';

const GRID_SIZE = 4;
const SHOW_TIME = 3000;

// Mock backend call (replace with socketService + gameManager later)
const fetchGamePattern = (currentLevel = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const positions = [];
      const count = Math.min(2 + currentLevel - 1, 6); // Level-based: 2 + (level-1), max 6
      while (positions.length < count) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        if (!positions.some(p => p.row === row && p.col === col)) {
          positions.push({ row, col });
        }
      }
      resolve({
        id: Date.now(),
        size: GRID_SIZE,
        pattern: positions,
        showTime: SHOW_TIME
      });
    }, 500);
  });
};

const checkAccuracy = (guess, pattern) => {
  return guess.length === pattern.length && 
         guess.every((pos, i) => pos.row === pattern[i].row && pos.col === pattern[i].col);
};

const MemoryMatrix = () => {
  const { selectGame } = useMultiplayer();

  useEffect(() => {
    selectGame('memoryMatrix');
  }, [selectGame]);
  const [gameData, setGameData] = useState(null);
  const [showPattern, setShowPattern] = useState(false);
  const [userGrid, setUserGrid] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [phase, setPhase] = useState('idle'); // idle, showing, playing, success, gameOver, win
const [result, setResult] = useState({ correct: false, accuracy: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(10);
  const [currentPhase, setCurrentPhase] = useState('idle');

const startGame = useCallback(async () => {
    const data = await fetchGamePattern(level);
    setGameData(data);
    setUserGrid(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setPhase('showing');
    setShowPattern(true);
    
    setTimeout(() => {
      setShowPattern(false);
      setPhase('playing');
    }, data.showTime);
  }, [level]);

  const toggleCell = useCallback((index) => {
    if (phase !== 'playing') return;
    const newGrid = [...userGrid];
    newGrid[index] = !newGrid[index];
    setUserGrid(newGrid);
  }, [userGrid, phase]);

  const getUserGuess = useCallback(() => {
    return userGrid
      .map((lit, i) => lit ? { row: Math.floor(i / GRID_SIZE), col: i % GRID_SIZE } : null)
      .filter(Boolean);
  }, [userGrid]);

  const autoNext = useCallback(() => {
    setLevel(prev => Math.min(prev + 1, maxLevel));
    startGame();
  }, [maxLevel, startGame]);

  const submitGuess = useCallback(() => {
    if (!gameData) return;
    const guess = getUserGuess();
    const correct = checkAccuracy(guess, gameData.pattern);
    const accuracy = Math.floor((guess.filter((pos, i) => 
      gameData.pattern.some(p => p.row === pos.row && p.col === pos.col)
    ).length / gameData.pattern.length) * 100);
    
    setResult({ correct, accuracy });
    if (correct) {
      setScore(prev => prev + 100);
      setPhase('success');
      if (level + 1 > maxLevel) {
        setPhase('win');
      } else {
        setTimeout(autoNext, 2500);
      }
    } else {
      setPhase('gameOver');
    }
  }, [gameData, getUserGuess, level, maxLevel, autoNext]);

  const newGame = useCallback(() => {
    setPhase('idle');
    setGameData(null);
    setUserGrid(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setResult({ correct: false, accuracy: 0 });
    setLevel(1);
    setScore(0);
  }, []);

  const renderCell = (row, col, isLit = false, clickable = false) => {
    const index = row * GRID_SIZE + col;
    const userLit = userGrid[index];
    
    let className = 'w-16 h-16 border border-gray-300 flex items-center justify-center text-sm font-bold transition-all duration-300 ease-in-out hover:border-blue-400 hover:shadow-md';
    
    if (isLit || userLit) {
      className += ' bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg animate-pulse';
    } else {
      className += ' bg-white hover:bg-gray-50';
    }
    
    if (phase === 'result') {
      if (isLit && !userLit) {
        className += ' animate-bounce border-red-400 bg-red-100';
      } else if (userLit && !isLit) {
        className += ' animate-pulse border-orange-400 bg-orange-100';
      }
    }
    
    if (clickable) {
      className += ' cursor-pointer active:scale-95';
    }

    return (
      <div
        key={`${row}-${col}`}
        className={className}
        onClick={() => toggleCell(index)}
      >
        {isLit ? '●' : ''}
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gradient-to-b from-indigo-50 to-purple-50 rounded-2xl shadow-2xl">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 text-center">
        🧠 Memory Matrix
      </h1>
      
      <div className="mb-8">
        <div className="text-center mb-4">
<div className={`text-2xl text-black font-bold ${phase === 'result' || phase === 'success' || phase === 'gameOver' ? 'animate-pulse' : ''}`}>
            Score: <span className="text-3xl text-green-600">{score}</span> | Level: <span className="text-2xl text-purple-600 font-bold">{level}</span>
          </div>
<div className={`mt-2 text-xl text-black font-semibold ${
            (phase === 'result' || phase === 'success' || phase === 'gameOver') 
              ? result.correct ? 'text-green-600 animate-bounce' : 'text-red-600 animate-shake'
              : ''
          }`}>
            {phase === 'showing' && '👀 Memorize the pattern!'}
            {phase === 'playing' && '🖱️ Recreate the pattern'}
            {phase === 'success' && `🎉 Perfect! Level ${level + 1} starting in 3...`}
            {phase === 'result' && `${result.correct ? '✅ Correct!' : '❌ Missed!'} ${result.accuracy}%`}
            {phase === 'gameOver' && `💥 Game Over! Final Score: ${score}`}
            {phase === 'win' && '🏆 Victory! You completed all levels!'}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-4 gap-1 mb-8 mx-auto w-fit animate-fade-in">
        {Array.from({ length: GRID_SIZE }, (_, row) =>
          Array.from({ length: GRID_SIZE }, (_, col) => {
            const isPatternLit = showPattern && gameData?.pattern.some(p => p.row === row && p.col === col);
            const clickable = phase === 'playing';
            return renderCell(row, col, isPatternLit, clickable);
          })
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4 justify-center flex-wrap">
{phase === 'idle' && (
          <Button 
            onClick={startGame}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-3 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            🚀 Start Game
          </Button>
        )}
        
        {phase === 'playing' && (
          <Button 
            onClick={submitGuess}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 px-8 py-3 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            disabled={userGrid.every(v => !v)}
          >
            ✅ Submit
          </Button>
        )}
        
        {phase === 'success' && (
          <div className="text-center animate-pulse">
            <div className="text-lg text-blue-600 mb-2">Next level starting soon...</div>
          </div>
        )}
        
        {(phase === 'gameOver' || phase === 'win' || phase === 'result') && (
          <Button 
            onClick={newGame}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-10 py-3 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            🔄 {phase === 'win' ? 'Play Again' : 'New Game'}
          </Button>
        )}
        
        {phase === 'playing' && (
          <Button 
            onClick={newGame}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 px-6 py-3 text-sm font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Quit
          </Button>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MemoryMatrix;

