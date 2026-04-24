import React, { useState, useEffect } from 'react';
import { useMultiplayer } from '../common/MultiplayerManager';
import ConceptClash from './ConceptClash';
import { Brain, Sword, Zap } from 'lucide-react';

const mockGameData = {
  numPairs: 5,
  shuffledTerms: [
    'Neural Network',
    'Backpropagation',
    'Gradient Descent',
    'Activation Function',
    'Epoch'
  ],
  shuffledDefinitions: [
    'Algorithm that computes loss gradient through reverse pass',
    'Process of training over entire dataset multiple times',
    'Non-linear function applied after matrix multiplication',
    'Optimization algorithm minimizing loss via step updates',
    'Multi-layer model inspired by brain neuron connections'
  ],
  correctMatches: { // index mappings
    0: 4, 1: 0, 2: 3, 3: 2, 4: 1
  }
};

const ConceptClashGame = () => {
  const { selectGame } = useMultiplayer();
  const [gameData] = useState(mockGameData);
  const [feedback, setFeedback] = useState({ show: false, score: 0, correctCount: 0, total: mockGameData.numPairs });
  const [score, setScore] = useState(0);

  useEffect(() => {
    selectGame('conceptClash');
  }, [selectGame]);

  const handleSubmit = (userMatches) => {
    let correct = 0;
    userMatches.forEach(({ termIndex, defIndex }) => {
      if (defIndex === mockGameData.correctMatches[termIndex]) correct++;
    });
    const userScore = Math.floor((correct / mockGameData.numPairs) * 100);
    setScore(prev => prev + userScore);
    setFeedback({ show: true, score: userScore, correctCount: correct, total: mockGameData.numPairs });
  };

  const handlePlayAgain = () => {
    setFeedback({ show: false, score: 0, correctCount: 0, total: mockGameData.numPairs });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
            ⚔️ Concept Clash
          </h1>
          <div className="flex items-center justify-center gap-4 text-2xl mb-8">
            <div className="bg-white/20 backdrop-blur-xl px-6 py-3 rounded-2xl text-white font-bold shadow-2xl">
              Score: <span className="text-3xl text-emerald-400">{score}</span>
            </div>
            {feedback.show && (
              <div className="bg-emerald-500/30 border-2 border-emerald-500 px-6 py-3 rounded-2xl text-emerald-200 font-bold">
                {feedback.score}% - {feedback.correctCount}/{feedback.total}
              </div>
            )}
          </div>
        </div>
        
        <ConceptClash 
          gameData={gameData} 
          onSubmit={handleSubmit}
          playerName="You"
        />
        
        {feedback.show && (
          <div className="text-center mt-12">
            <button
              onClick={handlePlayAgain}
              className="px-12 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-xl font-bold rounded-3xl shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all text-white"
            >
              🎮 New Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptClashGame;

