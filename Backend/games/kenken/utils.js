/**
 * KenKen Game Utilities
 * Updated for GameManager interface
 */

// Existing utilities
export const generateKenkenGrid = () => {
  // Generate sample 4x4 KenKen puzzle data
  const grid = Array(4).fill().map(() => Array(4).fill(0));
  // Fill with simple solvable pattern
  const solution = [
    [2, 4, 1, 3],
    [1, 3, 4, 2],
    [4, 2, 3, 1],
    [3, 1, 2, 4]
  ];
  return grid; // Empty for player to fill
};

export const validateKenkenMove = (grid, row, col, value) => {
  // Basic validation: no duplicates in row/col
  if (value < 1 || value > 4) return false;
  const rowValues = grid[row].filter((v, i) => i !== col);
  const colValues = grid.map(r => r[col]).filter((v, i) => i !== row);
  return !rowValues.includes(value) && !colValues.includes(value);
};

export const checkKenkenComplete = (grid) => {
  return grid.every(row => row.every(cell => cell > 0));
};

// GameManager interface
export const generateGameData = () => {
  const grid = generateKenkenGrid();
  const solution = [
    [2, 4, 1, 3],
    [1, 3, 4, 2],
    [4, 2, 3, 1],
    [3, 1, 2, 4]
  ];
  return {
    id: Date.now(),
    type: 'kenken',
    grid,
    solution, // Hidden from player
    size: 4
  };
};

export const validateAnswer = (userGrid, gameData) => {
  // Compare player grid to solution
  for (let r = 0; r < gameData.size; r++) {
    for (let c = 0; c < gameData.size; c++) {
      if (userGrid[r][c] !== gameData.solution[r][c]) {
        return false;
      }
    }
  }
  return true;
};

export const calculateScore = (results) => {
  // results: {moves: number, timeUsed: number}
  const perfectMoves = 16; // 4x4
  const accuracy = results.moves === perfectMoves ? 100 : (results.moves / perfectMoves) * 100;
  return Math.floor(accuracy * (1 - results.timeUsed / 60)); // Bonus for speed
};

// Export for GameManager
export default {
  generateGameData,
  validateAnswer,
  calculateScore
};

