import React, { useState, useCallback } from 'react';

const ConceptClash = ({ gameData, onSubmit, playerName = 'Player' }) => {
  const [matches, setMatches] = useState({});
  const [feedback, setFeedback] = useState({});
  const [draggedTerm, setDraggedTerm] = useState(null);
  const [gameComplete, setGameComplete] = useState(false);

  const handleDragStart = useCallback((e, termIndex) => {
    setDraggedTerm(termIndex);
    e.dataTransfer.setData('text/plain', termIndex.toString());
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e, defIndex) => {
    e.preventDefault();
    const termIndex = parseInt(e.dataTransfer.getData('text/plain'));
    setMatches(prev => ({ ...prev, [termIndex]: defIndex }));
    setDraggedTerm(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const userMatches = Object.entries(matches).map(([termIndexStr, defIndex]) => ({
      termIndex: parseInt(termIndexStr),
      defIndex: parseInt(defIndex)
    }));
    onSubmit(userMatches);
  }, [matches, onSubmit]);

  const termStyle = (termIndex) => {
    const matched = matches[termIndex];
    if (!feedback.show) return '';
    const correct = feedback.results?.find(r => r.termIndex === termIndex)?.isCorrect;
    return correct ? 'bg-green-400 ring-4 ring-green-500' : 'bg-red-400 ring-4 ring-red-500';
  };

  const defStyle = (defIndex, termIndex) => {
    if (!feedback.show || !termIndex) return '';
    const result = feedback.results?.find(r => r.defIndex === defIndex && r.termIndex === termIndex);
    const correct = result?.isCorrect;
    return correct ? 'bg-green-400 ring-2 ring-green-500 border-green-600' : 'bg-red-400 ring-2 ring-red-500 border-red-600';
  };

  if (!gameData) return <div className="p-8 text-center">Loading game...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Concept Clash Matching</h1>
        
        <div className="grid grid-cols-2 gap-12 items-start">
          {/* Terms Column */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Terms</h2>
            <div className="space-y-4">
              {gameData.shuffledTerms.map((term, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-2xl shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 border-4 border-dashed border-gray-300 hover:border-blue-400 hover:shadow-2xl hover:scale-105 ${termStyle(index)} draggable`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                >
                  <div className="text-xl font-bold text-gray-800">{term}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Definitions Column */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Definitions</h2>
            <div className="space-y-4">
              {gameData.shuffledDefinitions.map((definition, index) => (
                <div
                  key={index}
                  className={`p-6 min-h-[100px] rounded-2xl shadow-lg border-4 border-dashed border-gray-300 hover:border-green-400 transition-all duration-300 hover:shadow-xl ${defStyle(index, matches[Object.keys(matches).find(k => matches[k] === index)] || null)}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="text-lg text-gray-700 leading-relaxed">{definition}</div>
                  <div className="mt-2 text-sm font-medium text-gray-500">
                    Drop term here
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 mb-4">
            <span className="text-lg font-medium text-gray-700">
              Matches: {Object.keys(matches).length}/{gameData.numPairs}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(matches).length !== gameData.numPairs}
            className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-full shadow-2xl hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Submit Matches
          </button>
        </div>

        {feedback.show && (
          <div className="mt-12 p-8 bg-white rounded-3xl shadow-2xl">
            <h3 className="text-2xl font-bold text-center mb-6">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xl font-semibold mb-4">Score: {feedback.score}%</h4>
                <div>Correct: {feedback.correctCount}/{feedback.total}</div>
              </div>
              <div>
                <button
                  onClick={() => setFeedback({show: false})}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConceptClash;

