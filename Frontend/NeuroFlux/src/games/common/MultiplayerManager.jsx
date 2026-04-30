import React, { createContext, useCallback, useContext, useState } from 'react';
import useMultiplayerGame from '../../hooks/useMultiplayerGame';

/**
 * Multiplayer Context Manager
 */

const MultiplayerContext = createContext();

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const multiplayer = useMultiplayerGame();

  const selectGame = useCallback((gameName) => {
    setSelectedGame(gameName);
  }, []);

  return (
    <MultiplayerContext.Provider value={{
      ...multiplayer,
      selectedGame,
      selectGame
    }}>
      {children}
    </MultiplayerContext.Provider>
  );
};
