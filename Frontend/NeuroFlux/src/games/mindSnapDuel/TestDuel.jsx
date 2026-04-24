import React from 'react';
import MindSnapDuel from './MindSnapDuel';

const TestDuel = () => {
  const handleAnswer = (data) => {
    console.log('Answer:', data);
  };

  const handleNext = (index) => {
    console.log('Next question:', index);
  };

  return (
    <>
      <MindSnapDuel 
        opponentScore={180} 
        onAnswer={handleAnswer}
        onNext={handleNext}
      />
    </>
  );
};

export default TestDuel;
