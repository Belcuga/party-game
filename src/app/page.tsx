'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Drink, Gender, Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';
import { supabase } from './lib/SupabaseClient';
import { GamePlayer, GameState } from './types/game';
import { useGame } from './providers/GameContext';
import { SettingsLabel } from './types/gameSettings';
import AdsLayout from './components/ad-layout/AdsLayout';
import { Question } from './types/question';
import SettingsMenu from './components/ui/SettingsMenu';
import HowToPlayButton from './components/ui/HowToPlayButton';
import Logo from './components/ui/logo';
import ModeSelect, { GAME_MODES, GameModeId } from './components/game/ModeSelect';
import ModeLobby from './components/game/ModeLobby';
import SimpleRoster from './components/game/SimpleRoster';
import FullRoster from './components/game/FullRoster';
import GameOptions from './components/game/GameOptions';
import { startingDifficultyIndex } from './types/drunkenness';

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<'modes' | 'setup' | 'quickOptions' | 'gameOptions'>('modes');
  const [selectedModeId, setSelectedModeId] = useState<GameModeId | null>(null);
  const selectedMode = GAME_MODES.find((m) => m.id === selectedModeId) ?? null;
  const isNameOnlyRoster = selectedMode?.rosterFields === 'name-only';
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleModeContinue = () => {
    if (!selectedMode) return;
    setView(selectedMode.needsRoster ? 'setup' : 'quickOptions');
  };

  const settings: SettingsLabel[] = [
    { label: 'Include Spicy Questions (18+)', tooltip: 'Mixes in 18+ questions alongside the regular ones.', value: 'adultMode' },
    { label: 'Include Challenges', tooltip: 'Mixes in physical or action-based dares alongside regular questions.', value: 'challenges' },
    { label: 'Only Spicy Stuff (18+)', tooltip: 'Skips everything else - every question will be 18+.', value: 'dirtyMode' },
    { label: 'Punishment Roulette', tooltip: 'Random chance each round someone gets hit with a silly rule or instant punishment - lasts until their next turn.', value: 'punishmentRoulette' },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [drunkenness, setDrunkenness] = useState(0);
  const [gameSettings, setGameSettings] = useState({
    adultMode: false,
    challenges: false,
    dirtyMode: false,
    punishmentRoulette: false,
  });
  const { gameState, setGameState, setLoading, players, setPlayers } = useGame();

  const toggleSetting = (key: 'adultMode' | 'challenges' | 'dirtyMode' | 'punishmentRoulette') => {
    setGameSettings((prev) => {
      if (key === 'punishmentRoulette') {
        return {
          ...prev,
          punishmentRoulette: !prev.punishmentRoulette,
        };
      }
      if (key === 'dirtyMode') {
        if (!prev[key]) {
          return {
            ...prev,
            dirtyMode: true,
            adultMode: false,
            challenges: false
          };
        }
        return {
          ...prev,
          dirtyMode: false
        };
      } else {
        return {
          ...prev,
          [key]: !prev[key],
          dirtyMode: false
        };
      }
    });
  };

  const startGame = async () => {
    if (players.length < 2) return;

    setLoading(true);

    const pageSize = 1000;
    let from = 0;
    let moreData = true;
    const questionMap = new Map();

    while (moreData) {
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (error) {
        console.error('Failed to fetch questions:', error.message);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        data.forEach((q) => questionMap.set(q.id, q));
        from += pageSize;
      } else {
        moreData = false;
      }
    }

    const allQuestions = Array.from(questionMap.values());
    const filteredQuestions = allQuestions.filter((q: Question) => {
      if (gameSettings.dirtyMode) {
        if (q.dirty) return true;
        return false;
      }
      else {
        if (!gameSettings.adultMode && q.dirty) return false;
        if (!gameSettings.challenges && q.challenge) return false;
        return true;
      }
    });

    const existingDifficulties = [...new Set(filteredQuestions.map(q => q.difficulty))].sort((a, b) => a - b);
    const startIndex = startingDifficultyIndex(drunkenness, existingDifficulties.length);

    const initializedPlayers = players.map((p) => ({
      playerInfo: {
        id: String(p.id),
        name: p.name,
        gender: p.gender,
        drink: p.drink,
        single: p.single
      },
      skipCount: 1,
      totalQuestionsAnswered: 0,
      drankCount: 0,
    } as GamePlayer));

    initializedPlayers.push({
      playerInfo: {
        id: String(0),
        name: 'All Players',
        gender: Gender.None,
        drink: Drink.None,
        single: false,
      },
      skipCount: 0,
      totalQuestionsAnswered: 0,
      drankCount: 0,
    } as GamePlayer);

    const gameState: GameState = {
      players: initializedPlayers,
      questions: filteredQuestions,
      answeredQuestionIds: [],
      roundPlayersLeft: initializedPlayers.map(p => p.playerInfo.id),
      currentPlayerId: null,
      currentQuestion: null,
      roundNumber: 1,
      existingDifficulties: existingDifficulties,
      tableDifficultyIndex: startIndex,
      pendingDifficultyBoost: false,
      punishmentRouletteEnabled: gameSettings.punishmentRoulette,
    };

    setGameState(gameState);
    router.push(`/game`);
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => {
      const removedPlayer = prev[index];

      if (!gameState) {
        return prev.filter((_, i) => i !== index);
      }

      const updatedPlayers = gameState.players.filter(
        (p) => p.playerInfo.id !== removedPlayer.id
      );

      // Explicitly define all fields required by GameState
      const updatedGameState: GameState = {
        players: updatedPlayers,
        questions: gameState.questions ?? [],
        answeredQuestionIds: gameState.answeredQuestionIds ?? [],
        roundPlayersLeft: [],
        currentPlayerId: '0',
        currentQuestion: gameState.currentQuestion ?? null,
        roundNumber: gameState.roundNumber ?? 1,
        existingDifficulties: gameState.existingDifficulties ?? [],
        tableDifficultyIndex: gameState.tableDifficultyIndex ?? 0,
        pendingDifficultyBoost: gameState.pendingDifficultyBoost ?? false,
        punishmentRouletteEnabled: gameState.punishmentRouletteEnabled ?? false,
      };
      setGameState(updatedGameState);
      return prev.filter((_, i) => i !== index);
    });
  };

  const updatePlayers = (player: Player) => {
    setPlayers((prev) => {
      if (!gameState) {
        return [...prev, player];
      }
      const gamePlayer = {
        playerInfo: player,
        skipCount: 1,
        totalQuestionsAnswered: 0,
        drankCount: 0,
      };
      const updatedPlayers = [...gameState.players, gamePlayer]

      const updatedGameState: GameState = {
        players: updatedPlayers,
        questions: gameState.questions ?? [], // fallback if undefined
        answeredQuestionIds: gameState.answeredQuestionIds ?? [],
        roundPlayersLeft: gameState.roundPlayersLeft,
        currentPlayerId: gameState.currentPlayerId,
        currentQuestion: gameState.currentQuestion ?? null,
        roundNumber: gameState.roundNumber ?? 1, // adjust fallback if needed
        existingDifficulties: gameState.existingDifficulties ?? [],
        tableDifficultyIndex: gameState.tableDifficultyIndex ?? 0,
        pendingDifficultyBoost: gameState.pendingDifficultyBoost ?? false,
        punishmentRouletteEnabled: gameState.punishmentRouletteEnabled ?? false,
      };

      setGameState(updatedGameState);
      return [...prev, player];
    })
  }

  const updatePlayerAt = (index: number, updated: Player) => {
    setPlayers((prev) => {
      const next = prev.map((p, i) => (i === index ? updated : p));

      if (gameState) {
        const updatedGameState: GameState = {
          ...gameState,
          players: gameState.players.map((gp) =>
            gp.playerInfo.id === updated.id ? { ...gp, playerInfo: updated } : gp
          ),
        };
        setGameState(updatedGameState);
      }

      return next;
    });
  };

  const handlePlayerSubmit = (player: Player) => {
    if (editingIndex !== null) {
      updatePlayerAt(editingIndex, player);
    } else {
      updatePlayers(player);
    }
  };

  return (
    <AdsLayout>
      <main className="flex flex-col items-start sm:items-center h-full">
        <div className="w-full flex items-center justify-between px-6 mb-6">
          <div className="hidden sm:block w-8" /> {/* Spacer to maintain centering */}
          <div className="flex items-center gap-2">
            <Logo/>
            <h1 className="text-2xl sm:text-4xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>
          <div className="flex items-center gap-3">
            {view === 'setup' && selectedMode && (
              <HowToPlayButton
                modeName={selectedMode.name}
                color={selectedMode.color}
                description={selectedMode.howToPlay ?? selectedMode.tagline}
              />
            )}
            <SettingsMenu />
          </div>
        </div>

        {view === 'modes' && (
          <ModeSelect
            selectedModeId={selectedModeId}
            onSelect={setSelectedModeId}
            onContinue={handleModeContinue}
          />
        )}

        {view === 'quickOptions' && selectedMode && (
          <ModeLobby
            mode={selectedMode}
            spicy={gameSettings.adultMode}
            onToggleSpicy={() => toggleSetting('adultMode')}
            onChangeMode={() => setView('modes')}
            onStart={() => {
              if (selectedMode.route) router.push(`${selectedMode.route}?spicy=${gameSettings.adultMode}`);
            }}
          />
        )}

        {view === 'setup' && selectedMode && isNameOnlyRoster && (
          <SimpleRoster
            mode={selectedMode}
            players={players}
            onAdd={updatePlayers}
            onRemove={removePlayer}
            onChangeMode={() => setView('modes')}
            onStart={() => {
              if (selectedMode.route) router.push(`${selectedMode.route}?spicy=${gameSettings.adultMode}`);
            }}
          />
        )}

        {view === 'setup' && selectedMode && !isNameOnlyRoster && (
          <FullRoster
            mode={selectedMode}
            players={players}
            onAddClick={() => {
              setEditingIndex(null);
              setModalOpen(true);
            }}
            onEdit={(index) => {
              setEditingIndex(index);
              setModalOpen(true);
            }}
            onRemove={removePlayer}
            onChangeMode={() => setView('modes')}
            onContinue={() => setView('gameOptions')}
          />
        )}

        {view === 'gameOptions' && selectedMode && (
          <GameOptions
            mode={selectedMode}
            onBack={() => setView('setup')}
            onStart={startGame}
            settings={settings}
            gameSettings={gameSettings}
            onToggleSetting={toggleSetting}
            drunkenness={drunkenness}
            onSetDrunkenness={setDrunkenness}
          />
        )}

        <AddPlayerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handlePlayerSubmit}
          existingNames={players.map((p) => p.name)}
          editingPlayer={editingIndex !== null ? players[editingIndex] : null}
        />
      </main>
    </AdsLayout>
  );
}
