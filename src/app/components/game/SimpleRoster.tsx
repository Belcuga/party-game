'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import Button from '../ui/Button';
import type { Mode } from './ModeSelect';
import { Player, Gender, Drink } from '../../types/player';

type Props = {
  mode: Mode;
  players: Player[];
  onAdd: (player: Player) => void;
  onRemove: (index: number) => void;
  onStart: () => void;
};

const AVATAR_COLORS = ['#00E676', '#ff6fd8', '#9156f3', '#ffb703', '#2dd4bf', '#fb7185', '#818cf8'];

export default function SimpleRoster({ mode, players, onAdd, onRemove, onStart }: Props) {
  const [name, setName] = useState('');
  const Icon = mode.icon;

  const trimmed = name.trim();
  const isDuplicate = trimmed.length > 0 && players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length > 0 && !isDuplicate;
  const isBuilt = !!mode.route;
  const canStart = players.length >= 2 && isBuilt;

  function submit() {
    if (!canAdd) return;
    onAdd({ id: uuid(), name: trimmed, gender: Gender.None, drink: Drink.None, single: undefined });
    setName('');
  }

  return (
    <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
      {/* Icon, title, input and the player list are one centered group - previously the list
          alone stretched to fill all leftover height, dumping empty space below it once the
          roster was short. Centering the whole group balances that space above and below. */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5">
        <div className="flex flex-col items-center text-center gap-3 flex-shrink-0">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/5"
            style={{ borderColor: mode.color, boxShadow: `0 0 28px ${mode.color}55` }}
          >
            <Icon className="w-9 h-9" style={{ color: mode.color }} strokeWidth={1.7} />
          </div>
          <h2 className="text-2xl font-bold">{mode.name}</h2>
        </div>

        <div className="w-full flex-shrink-0">
          <div className="flex gap-2 mb-1.5">
            <input
              type="text"
              maxLength={20}
              placeholder="Add a player's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              className="flex-1 min-w-0 px-4 py-3 text-base rounded-xl bg-[#3b1b5e] text-white border border-[#ffffff20] focus:outline-none focus:border-[#ffffff40] transition-colors"
            />
            <button
              onClick={submit}
              disabled={!canAdd}
              className="px-6 text-base rounded-xl font-bold text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: mode.color }}
            >
              Add
            </button>
          </div>
          <div className="h-5 mb-1">
            {isDuplicate && <p className="text-xs text-red-400 text-left">Name already taken.</p>}
          </div>

          <div className="w-full max-h-[40vh] overflow-y-auto">
            {players.length === 0 ? (
              <div className="text-center text-white/40 text-sm border border-dashed border-white/15 rounded-2xl py-8">
                No players yet - add at least 2 to start.
              </div>
            ) : (
              <ul className="flex flex-wrap justify-center gap-2.5">
                {players.map((p, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  return (
                    <li
                      key={p.id}
                      className="flex items-center gap-2.5 pl-2 pr-3 py-2 rounded-full bg-white/8"
                    >
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}33`, color }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-base font-medium">{p.name}</span>
                      <button
                        onClick={() => onRemove(i)}
                        className="text-white/40 hover:text-white/80 cursor-pointer ml-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 flex-shrink-0">
        <Button onClick={onStart} disabled={!canStart} className="w-full disabled:cursor-not-allowed">
          Start
        </Button>
        {players.length < 2 ? (
          <p className="text-center text-xs text-white/50 mt-2">Add at least 2 players to start.</p>
        ) : (
          !isBuilt && (
            <p className="text-center text-xs text-white/50 mt-2">
              We&apos;re building {mode.name} next - check back soon!
            </p>
          )
        )}
      </div>
    </div>
  );
}
