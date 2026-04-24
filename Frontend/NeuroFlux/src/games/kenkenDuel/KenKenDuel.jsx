import React, { useState, useEffect, useCallback } from 'react';
import { useMultiplayer } from '../common/MultiplayerManager';

// Mock KenKen functions
const generatePuzzle = () => ({
  n: 5,
  cages: [
    { cells: [[0,0]], op: '', target: 3 },
    { cells: [[0,1]], op: '', target: 1 },
    { cells: [[0,2]], op: '', target: 5 },
    { cells: [[0,3],[1,3]], op: '+', target: 7 },
    { cells: [[0,4]], op: '', target: 2 },
    { cells: [[1,0],[2,0]], op: '*', target: 6 },
    { cells: [[1,1]], op: '', target: 4 },
    { cells: [[1,2]], op: '', target: 2 },
    { cells: [[2,1],[3,1],[4,1]], op: '+', target: 9 },
    { cells: [[2,2]], op: '', target: 5 },
    { cells: [[2,3],[3,3]], op: '-', target: 1 },
    { cells: [[2,4]], op: '', target: 1 },
    { cells: [[3,0]], op: '', target: 2 },
    { cells: [[3,2],[4,2]], op: '*', target: 8 },
    { cells: [[3,4]], op: '', target: 4 },
    { cells: [[4,0]], op: '', target: 1 },
    { cells: [[4,3],[4,4]], op: '+', target: 5 }
  ]
});

const validateGrid = (grid, puzzle) => {
  const n = puzzle.n;
  const timeUsed = 300; // Mock time used

  // Simple validation: check rows/cols unique 1-n, cages satisfy
  for (let i = 0; i < n; i++) {
    const row = grid[i];
    const col = grid.map(r => r[i]);
    if (new Set(row).size !== n || row.some(v => v < 1 || v > n) || new Set(col).size !== n || col.some(v => v < 1 || v > n)) {
      return { valid: false, timeUsed, score: 0 };
    }
  }
  // Mock cage validation (always pass for demo)
  return { valid: true, timeUsed, score: 1000 - timeUsed * 2 };
};

const KenKenDuel = ({ opponentScore = 250 }) => {
  const { selectGame } = useMultiplayer();

  useEffect(() => {
    selectGame('kenken');
  }, []);
  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 });
  const [timer, setTimer] = useState(300); // 5 min
  const [validation, setValidation] = useState(null);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    const init = async () => {
      const newPuzzle = generatePuzzle();
      setPuzzle(newPuzzle);
      setGrid(Array(newPuzzle.n).fill().map(() => Array(newPuzzle.n).fill(0)));
    };
    init();
  }, []);

  useEffect(() => {
    if (!gameActive || timer <= 0) return;
    const id = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [gameActive, timer]);

  const updateCell = (r, c, value) => {
    if (!gameActive) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = value;
    setGrid(newGrid);
  };

  const handleNumberClick = (num) => {
    updateCell(selectedCell.r, selectedCell.c, num);
  };

  const handleCellClick = (r, c) => {
    setSelectedCell({ r, c });
  };

  const handleSubmit = async () => {
    if (!puzzle) return;
    const result = validateGrid(grid, puzzle);
    setValidation(result);
    if (result.valid) {
      setGameActive(false);
    }
  };

  const isValidCell = (r, c) => {
    if (!validation || !validation.valid) return true;
    return true; // Full validation on submit
  };

  if (!puzzle) return <div className="flex items-center justify-center h-screen text-white">Loading puzzle...</div>;

  const n = puzzle.n;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center p-4 gap-6">
      {/* Header */}
      <div className="flex w-full max-w-4xl justify-between items-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
          🧮 KenKen Duel (5x5)
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-2xl font-bold text-emerald-400">
            You: 320
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl">
            {opponentScore}
          </div>
          <div className={`px-6 py-3 rounded-xl font-mono font-bold text-xl border-4 ${
            timer < 60 ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
          }`}>
            <span>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="relative">
        {/* Cage overlays */}
        {puzzle.cages.map((cage, idx) => (
          <div
            key={idx}
            className="absolute border-4 border-dashed border-yellow-400 rounded-lg bg-yellow-500/10 p-1 pointer-events-none"
            style={{
              top: `${cage.cells[0][0] * 64}px`,
              left: `${cage.cells[0][1] * 64}px`,
              width: `${Math.max(...cage.cells.map(([r,c]) => c)) - Math.min(...cage.cells.map(([r,c]) => c)) + 1 * 64}px`,
              height: `${Math.max(...cage.cells.map(([r,c]) => r)) - Math.min(...cage.cells.map(([r,c]) => r)) + 1 * 64}px`
            }}
          >
            <div className="absolute -top-8 -left-2 bg-black/80 text-yellow-300 px-2 py-1 rounded text-sm font-bold min-w-[50px] text-center">
              {cage.op}{cage.target}
            </div>
          </div>
        ))}
        
        <div className="grid grid-cols-5 gap-0.5 bg-gray-700 p-2 rounded-xl shadow-2xl max-w-md mx-auto">
          {grid.map((row, r) => 
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-16 h-16 bg-white border-4 border-gray-300 rounded-lg flex items-center justify-center text-2xl font-bold cursor-pointer transition-all hover:scale-105 focus:scale-110 shadow-md
                  ${selectedCell.r === r && selectedCell.c === c ? 'ring-4 ring-blue-400 shadow-blue-500/25' : ''}
                  ${!isValidCell(r, c) ? 'bg-red-200 border-red-400 animate-pulse' : ''}
                  ${value ? 'text-gray-800 shadow-inner' : 'text-gray-400'}
                `}
                onClick={() => handleCellClick(r, c)}
              >
                {value || ''}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Number pad */}
      <div className="grid grid-cols-5 gap-2 max-w-md">
        {[...Array(5)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => handleNumberClick(i + 1)}
            disabled={!gameActive}
            className="w-20 h-20 bg-gradient-to-b from-gray-200 to-gray-300 text-2xl text-black font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-300 hover:to-blue-400"
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!gameActive}
        className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Solution
      </button>

      {/* Results */}
      {validation && (
        <div className={`p-8 rounded-2xl text-center max-w-md ${
          validation.valid ? 'bg-emerald-500/20 border-4 border-emerald-500 text-emerald-200' : 'bg-red-500/20 border-4 border-red-500 text-red-200'
        }`}>
          <h3 className="text-3xl font-bold mb-4">
            {validation.valid ? 'Perfect! 🎉' : 'Try Again ❌'}
          </h3>
          <p>Time: {validation.timeUsed}s</p>
          <p>Score: {validation.score}</p>
          {validation.valid && <p className="text-sm mt-4 opacity-75">Duel complete!</p>}
        </div>
      )}

      <div className="text-gray-500 text-sm mt-8">
        Click cell → number pad to fill | Submit to validate
      </div>
    </div>
  );
};

export default KenKenDuel;
