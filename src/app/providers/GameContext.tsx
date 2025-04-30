'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Drink, Gender } from '../types/player';

export type GamePlayer = {
  id: string;
  name: string;
  gender: Gender;
  drink: Drink;
  skipCount: number;
  difficultyQueue: number[];
  difficultyIndex: number;
  totalQuestionsAnswered: number;
};

export type GameQuestion = {
  id: number;
  question: string;
  dirty: boolean;
  challenge: boolean;
  punishment: number;
  difficulty: number;
  like_count: number;
  dislike_count: number;
  all_players: boolean;
  need_opposite_gender: boolean;
};

export type GameState = {
  players: GamePlayer[];
  questions: GameQuestion[];
  answeredQuestionIds: number[];
  roundPlayersLeft: string[];
  currentPlayerId: string | null;
  currentQuestion: GameQuestion | null;
  roundNumber: number;
  existingDifficulties: number[];
};

type GameContextType = {
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
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
    <GameContext.Provider value={{ gameState, setGameState }}>
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