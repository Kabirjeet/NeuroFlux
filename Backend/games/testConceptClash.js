import('./conceptClash/utils.js').then(module => {
  const { generateGameData, validateMatch } = module.default;
  
  const sampleText = `[paste SAMPLE_TEXT here for test]`;
  
  generateGameData(sampleText).then(gameData => {
    console.log('Game Data:', gameData);
    
    // Test validation
    const testMatches = gameData.pairs.map((_, i) => ({termIndex: i, defIndex: i})); // wrong shuffle
    const validation = validateMatch(testMatches, gameData);
    console.log('Validation:', validation);
  }).catch(console.error);
});
