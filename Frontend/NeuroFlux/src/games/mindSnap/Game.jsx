import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../common/MultiplayerManager';
import * as utils from './utils.js';

/**
 * MindSnap Game Component
 */

const MindSnapGame = () => {
  const [equation, setEquation] = useState('');
  const [answer, setAnswer] = useState('');
  const [score, setScore] = useState(0);
  const { selectGame } = useMultiplayer();

  useEffect(() => {
    selectGame('mindSnap');
  }, [selectGame]);

  const generateNewEquation = () => {
    const eq = utils.generateEquation();
    setEquation(eq);
    setAnswer('');
  };

  const handleAnswer = () => {
    const correct = utils.calculateAnswer(equation);
    const isCorrect = utils.validateAnswer(parseFloat(answer), correct);

    if (isCorrect) {
      setScore(score + 10);
    }
    generateNewEquation();
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🧠 MindSnap</h1>
      <div className="bg-gray-100 p-8 rounded-lg mb-8">
        <div className="text-4xl font-mono mb-4">{equation}</div>
        <input
          type="number"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-4 text-2xl border rounded-lg mb-4 text-black placeholder-gray-500"
          placeholder="Your answer"
        />
        <button
          onClick={handleAnswer}
          className="w-full bg-blue-500 text-white p-4 rounded-lg font-bold hover:bg-blue-600"
        >
          Submit Answer
        </button>
      </div>
      <div className="text-2xl font-bold">Score: {score}</div>
    </div>
  );
};

export default MindSnapGame;
