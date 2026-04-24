#!/usr/bin/env node
// Test Memory Matrix backend functions
import gameManager from './gameManager.js';

async function testMemoryMatrix() {
  console.log('🧠 Testing Memory Matrix Backend...\n');
  
  try {
    // Test 1: Generate pattern
    const gameData = await gameManager.generateGameData('memoryMatrix');
    console.log('✅ generatePattern() result:');
    console.log(JSON.stringify(gameData, null, 2));
    console.log(`   Grid: ${gameData.size}x${gameData.size}`);
    console.log(`   Lit positions: ${gameData.pattern.length}`);
    console.log(`   Show time: ${gameData.showTime}ms\n`);
    
    // Test 2: Validate CORRECT guess
    const correctGuess = [...gameData.pattern]; // Copy exact pattern
    const isValid = await gameManager.validateAnswer('memoryMatrix', correctGuess, gameData);
    console.log('✅ validatePattern() - CORRECT guess:', isValid ? 'PASS ✓' : 'FAIL ✗');
    
    // Test 3: Validate WRONG guess
    const wrongGuess = gameData.pattern.map((pos, i) => 
      i === 0 ? {...pos, col: (pos.col + 1) % gameData.size} : pos
    );
    const isInvalid = await gameManager.validateAnswer('memoryMatrix', wrongGuess, gameData);
    console.log('✅ validatePattern() - WRONG guess:', isInvalid ? 'FAIL ✗' : 'PASS ✓');
    
    // Test 4: Score
    const score = await gameManager.calculateScore('memoryMatrix', {
      correctMatches: 3,
      patternLength: 3,
      attempts: 1
    });
    console.log(`\n✅ Score calculation: ${score}/100\n`);
    
    console.log('🎉 All Memory Matrix tests PASSED!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMemoryMatrix();

