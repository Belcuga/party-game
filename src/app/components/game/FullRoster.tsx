'use client';

import { TrashIcon, PencilIcon } from 'lucide-react';
import Button from '../ui/Button';
import { ModeChip } from './ModeSelect';
import type { Mode } from './ModeSelect';
import { Player, Gender, Drink } from '../../types/player';

type Props = {
  mode: Mode;
  players: Player[];
  onAddClick: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  onChangeMode: () => void;
  onContinue: () => void;
};

const DRINK_LABEL: Record<Drink, string> = {
  [Drink.Beer]: 'Beer',
  [Drink.Wine]: 'Wine',
  [Drink.Strong]: 'Strong',
  [Drink.None]: '',
};

export function isPlayerIncomplete(player: Player): boolean {
  return player.gender === Gender.None || player.drink === Drink.None || player.single === undefined;
}

export default function FullRoster({ mode, players, onAddClick, onEdit, onRemove, onChangeMode, onContinue }: Props) {
  const Icon = mode.icon;
  const hasIncompletePlayers = players.some(isPlayerIncomplete);
  const canContinue = players.length >= 2 && !hasIncompletePlayers;

  return (
    <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
      <div className="flex flex-col items-center text-center gap-2 mb-5 flex-shrink-0">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white/5"
          style={{ borderColor: mode.color, boxShadow: `0 0 24px ${mode.color}55` }}
        >
          <Icon className="w-6 h-6" style={{ color: mode.color }} strokeWidth={1.7} />
        </div>
        <h2 className="text-xl font-bold">{mode.name}</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto w-full">
        {players.length === 0 && (
          <div className="text-center text-white/40 text-sm border border-dashed border-white/15 rounded-2xl py-12">
            No players yet - add at least 2 to start.
          </div>
        )}
        <ul className="space-y-2.5 w-full">
          {players.map((player, i) => {
            const incomplete = isPlayerIncomplete(player);
            const isMale = player.gender === Gender.Male;
            const avatarColor = player.gender === Gender.None ? '#9156f3' : isMale ? '#2196F3' : '#ff6fd8';
            return (
              <li
                key={player.id}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white/8 rounded-2xl"
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{ backgroundColor: `${avatarColor}33`, color: avatarColor, border: `1.5px solid ${avatarColor}` }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-base font-medium truncate">{player.name}</div>
                  {incomplete ? (
                    <div className="text-xs text-red-400 font-medium mt-0.5">Please add information</div>
                  ) : (
                    <div className="text-xs text-white/50 mt-0.5">
                      {isMale ? 'Male' : 'Female'} · {DRINK_LABEL[player.drink]} · {player.single ? 'Single' : 'Taken'}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onEdit(i)}
                  className="p-2 rounded-md bg-[#4e2a8e]/40 hover:bg-[#9156f3]/30 text-white/70 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemove(i)}
                  className="p-2 rounded-md bg-[#4e2a8e]/40 hover:bg-[#9156f3]/30 text-pink-300 hover:text-pink-100 transition-colors cursor-pointer flex-shrink-0"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex-shrink-0 pt-4">
        <Button onClick={onAddClick} className="w-full mb-3">
          Add a Player
        </Button>

        <Button onClick={onContinue} disabled={!canContinue} className="w-full disabled:cursor-not-allowed">
          Continue
        </Button>
        {players.length < 2 ? (
          <p className="text-center text-xs text-white/50 mt-2">Add at least 2 players to start.</p>
        ) : (
          hasIncompletePlayers && (
            <p className="text-center text-xs text-red-400 mt-2">Some players are missing info - tap Edit to fill it in.</p>
          )
        )}
        <div className="text-center mt-4">
          <ModeChip mode={mode} onClick={onChangeMode} />
        </div>
      </div>
    </div>
  );
}
