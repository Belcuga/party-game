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
  /** True once the saved roster/game state has been read from localStorage. A mode page
   *  that redirects away when `players` looks empty must wait for this first - otherwise
   *  every refresh briefly sees the pre-hydration empty array and kicks the player out. */
  playersHydrated: boolean;
};

const GameContext = createContext<ExtendedGameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  // Guards the persist effects below until the hydrate effect has run, so a fresh page
  // load doesn't briefly overwrite saved localStorage with the initial empty/null state.
  const [hydrated, setHydrated] = useState(false);

  // Read persisted state once on mount (client-only). Reading localStorage during the
  // initial state instead (a lazy useState initializer) makes the client's first render
  // diverge from the server's markup, which trips React's hydration mismatch check on
  // every full page refresh - this runs after hydration completes instead.
  useEffect(() => {
    try {
      const savedPlayers = localStorage.getItem('tipsyPlayers');
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed)) setPlayers(parsed);
      }
    } catch (error) {
      console.error('Failed to parse saved players:', error);
    }

    try {
      const savedGame = localStorage.getItem('party-game-state');
      if (savedGame) setGameState(JSON.parse(savedGame));
    } catch (error) {
      console.error('Failed to parse saved game:', error);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('tipsyPlayers', JSON.stringify(players));
  }, [players, hydrated]);

  useEffect(() => {
    if (!hydrated || !gameState) return;
    localStorage.setItem('party-game-state', JSON.stringify(gameState));
  }, [gameState, hydrated]);

  return (
    <GameContext.Provider value={{ gameState, setGameState, loading, setLoading, players, setPlayers, playersHydrated: hydrated }}>
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
