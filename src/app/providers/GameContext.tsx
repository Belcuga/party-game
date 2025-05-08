'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameContextType, GameState } from '../types/game';

type ExtendedGameContextType = GameContextType & {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameContext = createContext<ExtendedGameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  
  const [gameState, setGameState] = useState<GameState | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('party-game-state');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse saved game:', error);
        }
      }
    }
    return null;
  });

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('party-game-state', JSON.stringify(gameState));
    }
  }, [gameState]);

  return (
    <GameContext.Provider value={{ gameState, setGameState, loading, setLoading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context; 
}