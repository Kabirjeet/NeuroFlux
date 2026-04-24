 /**
 * KenKen Duel Backend Logic (5x5)
 * Simple but working implementation
 */

const OPS = ['+', '*'];
const N = 5;

/**
 * generatePuzzle() - Generate 5x5 KenKen puzzle
 * Returns {grid: [[0,0...]], cages: [{cells: [[r,c]], op: '+', target: 8}], solution: [[1,2..]], startTime}
 */
export const generatePuzzle = () => {
  const solution = generateLatinSquare();
  const cages = generateCages();
  const startTime = Date.now();
  
  // Verify solution satisfies cages
  for (const cage of cages) {
    if (!satisfiesCage(solution, cage)) {
      // Regenerate if invalid (simple approach)
      return generatePuzzle();
    }
  }

  return {
    n: N,
    grid: Array(N).fill().map(() => Array(N).fill(0)),
    cages,
    solution, // hidden
    startTime
  };
};

/**
 * validateGrid(userGrid, puzzle) - Check latin square + all cages correct
 * Returns {valid: bool, completed: bool, timeUsed: number, errors: []}
 */
export const validateGrid = (userGrid, puzzle) => {
  const { cages, solution, startTime, n } = puzzle;
  const timeUsed = Math.floor((Date.now() - startTime) / 1000);
  const completed = userGrid.every(row => row.every(cell => cell > 0));
  const errors = [];

  // Check latin square (no row/col repeats)
  for (let r = 0; r < n; r++) {
    const row = userGrid[r];
    if (new Set(row).size !== n || row.some(v => v < 1 || v > n)) {
      errors.push(`Row ${r + 1} invalid`);
    }
  }
  for (let c = 0; c < n; c++) {
    const col = userGrid.map(row => row[c]);
    if (new Set(col).size !== n || col.some(v => v < 1 || v > n)) {
      errors.push(`Col ${c + 1} invalid`);
    }
  }

  // Check cages
  for (const cage of cages) {
    if (!satisfiesCage(userGrid, cage)) {
      errors.push(`Cage ${cage.cells.map(([r,c]) => `(${r},${c})`).join(',')} invalid: expected ${cage.op}${cage.target}`);
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    completed,
    timeUsed,
    errors,
    score: valid && completed ? Math.max(0, 1000 - timeUsed * 10) : 0
  };
};

// Generate random latin square (simple randomized)
function generateLatinSquare() {
  let grid = Array(N).fill().map((_, i) => Array(N).fill().map((_, j) => (i + j) % N + 1));
  // Shuffle columns for randomness
  for (let i = 0; i < N; i++) {
    const col = Math.floor(Math.random() * N);
    const temp = [...grid[i]];
    for (let j = 0; j < N; j++) {
      grid[j][i] = temp[col];
    }
  }
  return grid;
}

// Generate simple cage structure (rectangular groups)
function generateCages() {
  const cages = [];
  // Random row cages
  for (let row = 0; row < N; row += Math.floor(Math.random() * 2 + 1)) {
    const size = Math.floor(Math.random() * 3) + 1;
    const target = Math.floor(Math.random() * 10) + 5;
    cages.push({
      cells: Array.from({length: Math.min(size, N - row)}, (_, k) => [row, k]),
      op: OPS[Math.floor(Math.random() * OPS.length)],
      target
    });
  }
  // Column cages
  for (let col = 0; col < N; col += Math.floor(Math.random() * 2 + 1)) {
    const size = Math.floor(Math.random() * 3) + 1;
    cages.push({
      cells: Array.from({length: Math.min(size, N)}, (_, k) => [k, col]),
      op: OPS[Math.floor(Math.random() * OPS.length)],
      target: Math.floor(Math.random() * 10) + 5
    });
  }
  return cages.slice(0, 10); // Limit cages
}

// Check if grid satisfies cage constraint
function satisfiesCage(grid, cage) {
  const values = cage.cells.map(([r, c]) => grid[r][c]);
  let result;
  if (cage.op === '+') {
    result = values.reduce((a, b) => a + b, 0);
  } else if (cage.op === '*') {
    result = values.reduce((a, b) => a * b, 1);
  }
  return result === cage.target;
}

console.log('KenKen duel utils loaded');
