'use client';

import { Info } from 'lucide-react';
import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { SettingsLabel } from '../../types/gameSettings';
import { DRUNKENNESS_LEVELS } from '../../types/drunkenness';

type GameSettingsState = { adultMode: boolean; challenges: boolean; dirtyMode: boolean; punishmentRoulette: boolean };

type Props = {
  onStart: () => void;
  settings: SettingsLabel[];
  gameSettings: GameSettingsState;
  onToggleSetting: (key: 'adultMode' | 'challenges' | 'dirtyMode' | 'punishmentRoulette') => void;
  drunkenness: number;
  onSetDrunkenness: (index: number) => void;
};

export default function GameOptions({
  onStart,
  settings,
  gameSettings,
  onToggleSetting,
  drunkenness,
  onSetDrunkenness,
}: Props) {
  return (
    <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col justify-center gap-8">
        <div>
          <div className="font-bold mb-1 text-center text-white text-xl">How drunk is everyone?</div>
          <p className="text-sm text-white/50 text-center mb-4">This sets how hard the first questions are.</p>
          <div className="grid grid-cols-2 gap-2.5">
            {DRUNKENNESS_LEVELS.map((level, index) => {
              const selected = drunkenness === index;
              return (
                <button
                  key={level.id}
                  onClick={() => onSetDrunkenness(index)}
                  className={`flex flex-col items-center gap-0.5 py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all border ${selected
                      ? 'bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white border-transparent'
                      : 'bg-white/5 text-white/70 hover:text-white border-white/10'
                    }`}
                >
                  {level.label}
                  <span className={`text-[11px] font-normal ${selected ? 'text-white/85' : 'text-white/40'}`}>
                    {level.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="font-bold mb-3 text-center text-white text-xl">Game Options</div>
          <div className="bg-white/5 rounded-2xl px-4 py-3 space-y-3">
            {settings.map((item, index) => (
              <div key={index} className="flex items-center justify-start gap-2 w-full">
                <Switch
                  checked={gameSettings[item.value]}
                  onChange={() => onToggleSetting(item.value)}
                  label={item.label}
                  size="small"
                />
                <div className="relative group flex items-center">
                  <Info className="w-3.5 h-3.5 text-white/40 hover:text-white/70 cursor-help" />
                  <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block w-56 text-left leading-snug bg-[#1b003c] border border-white/15 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10">
                    {item.tooltip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 pt-4">
        <Button onClick={onStart} className="w-full">
          Start Game
        </Button>
      </div>
    </div>
  );
}
