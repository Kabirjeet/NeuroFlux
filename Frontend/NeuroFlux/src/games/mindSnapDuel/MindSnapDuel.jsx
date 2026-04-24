import React, { useState, useEffect } from 'react';

const mockQuestions = [
  {
    question: '2 + 3 × 4 = ?',
    options: ['14', '20', '11', '18'],
    correct: 0 // index of correct answer
  },
  {
    question: '15 - 6 ÷ 2 = ?',
    options: ['12', '9', '6', '3'],
    correct: 1
  },
  {
    question: '4 × 5 - 8 = ?',
    options: ['12', '20', '28', '10'],
    correct: 1
  },
  {
    question: '9 + 7 ÷ 7 = ?',
    options: ['16', '9', '10', '2'],
    correct: 0
  },
  {
    question: '25 - 3 × 5 = ?',
    options: ['10', '20', '15', '40'],
    correct: 0
  }
];

const MindSnapDuel = ({ opponentScore = 150, onAnswer, onNext }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(10);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameActive, setGameActive] = useState(true);

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Timer logic
  useEffect(() => {
    if (!gameActive || showResult) return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActive, showResult, timer]);

  // Auto next after result
  useEffect(() => {
    if (showResult) {
      const timeout = setTimeout(() => {
        loadNextQuestion();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [showResult]);

  const handleOptionSelect = (optionIndex) => {
    if (!gameActive || showResult) return;
    
    setSelectedOption(optionIndex);
    
    // Simulate answer submission
    if (onAnswer) {
      onAnswer({
        question: currentQuestion.question,
        selected: optionIndex,
        correct: currentQuestion.correct,
        timeLeft: timer
      });
    }

    setShowResult(true);
    setGameActive(false);
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setGameActive(false);
    if (onAnswer) {
      onAnswer({
        question: currentQuestion.question,
        selected: null,
        correct: currentQuestion.correct,
        timeLeft: 0
      });
    }
  };

  const loadNextQuestion = () => {
    const nextIndex = (currentQuestionIndex + 1) % mockQuestions.length;
    setCurrentQuestionIndex(nextIndex);
    setTimer(10);
    setSelectedOption(null);
    setShowResult(false);
    setGameActive(true);
    
    if (onNext) {
      onNext(nextIndex);
    }
  };

  const isCorrect = selectedOption === currentQuestion.correct;
  const isWrong = selectedOption !== null && !isCorrect;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            ⚔️ Mind Snap Duel
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-emerald-400">
              You: {selectedOption !== null ? (isCorrect ? '✓' : '✗') + ' 120' : '120'}
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
              {opponentScore}
            </div>
            <div 
              className={`text-2xl font-mono font-bold px-4 py-2 rounded-xl ${
                timer <= 3 
                  ? 'bg-red-500/20 text-red-400 border-2 border-red-500/50 animate-pulse' 
                  : 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50'
              }`}
            >
              {timer}s
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-8 mb-8 text-center">
          <div className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-8 min-h-[120px] flex items-center justify-center">
            {currentQuestion.question}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(index)}
              disabled={!gameActive || showResult}
              className={`
                group relative p-6 md:p-8 rounded-2xl text-lg md:text-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1
                border-4 border-transparent
                ${!gameActive || showResult 
                  ? 'cursor-not-allowed' 
                  : 'hover:bg-emerald-500/20 hover:border-emerald-500/50 active:scale-95'
                }
                ${selectedOption === null 
                  ? 'bg-gray-700/50 text-gray-300 hover:text-emerald-300' 
                  : ''
                }
                ${selectedOption === index 
                  ? isCorrect 
                    ? 'bg-emerald-500/90 text-white border-emerald-400 shadow-emerald-500/25 scale-105 animate-pulse' 
                    : 'bg-red-500/90 text-white border-red-400 shadow-red-500/25 animate-pulse' 
                  : index === currentQuestion.correct && showResult 
                    ? 'bg-emerald-500/50 text-emerald-200 border-emerald-400/50' 
                    : 'bg-gray-700/50 text-gray-300'
                }
              `}
              aria-label={`Option ${index + 1}: ${option}`}
            >
              <span className="relative z-10">{option}</span>
              {showResult && selectedOption === index && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl animate-ping" />
              )}
            </button>
          ))}
        </div>

        {showResult && (
          <div className="text-center">
            <p className={`text-2xl font-bold mb-4 ${
              isCorrect ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isCorrect ? 'Correct! 🎉' : 'Wrong! 😤'}
            </p>
          </div>
        )}

        <div className="flex justify-center opacity-75 text-sm text-gray-400 mt-8">
          Next question loads automatically
        </div>
      </div>
    </div>
  );
};

export default MindSnapDuel;

