import express from 'express';

const router = express.Router();

// Placeholder endpoint so the server can start.
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Leaderboard endpoint not implemented yet',
  });
});

export default router;

