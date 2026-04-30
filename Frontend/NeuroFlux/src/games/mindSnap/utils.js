// Frontend utils mirror backend
export const generateEquation = () => {
  const ops = ['+', '-', '*'];
  const op1 = ops[Math.floor(Math.random() * ops.length)];
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 20) + 1;
  return `${num1} ${op1} ${num2}`;
};

export const calculateAnswer = (equation) => {
  try {
    return eval(equation.replace('?', ''));
  } catch {
    return 0;
  }
};

export const validateAnswer = (userAnswer, correctAnswer) => userAnswer === correctAnswer;
