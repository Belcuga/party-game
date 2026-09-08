'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GameContextType, GameState } from '../types/game';
import { Player } from '../types/player';

type ExtendedGameContextType = GameContextType & {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  /** The party's player roster, shared across every mode. A mode that doesn't need
   *  gender/drink/single just leaves those fields unset on the players it adds. */
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
};

const GameContext = createContext<ExtendedGameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const [players, setPlayers] = useState<Player[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tipsyPlayers');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (error) {
          console.error('Failed to parse saved players:', error);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tipsyPlayers', JSON.stringify(players));
  }, [players]);

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
    <GameContext.Provider value={{ gameState, setGameState, loading, setLoading, players, setPlayers }}>
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
