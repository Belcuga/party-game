'use client';

import Button from '../ui/Button';
import Switch from '../ui/Switch';
import { ModeChip } from './ModeSelect';
import type { Mode } from './ModeSelect';

type Props = {
  mode: Mode;
  spicy: boolean;
  onToggleSpicy: () => void;
  onChangeMode: () => void;
  onStart: () => void;
};

export default function ModeLobby({ mode, spicy, onToggleSpicy, onChangeMode, onStart }: Props) {
  const Icon = mode.icon;
  const isBuilt = !!mode.route;

  return (
    <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-center gap-5 py-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/5"
          style={{ borderColor: mode.color, boxShadow: `0 0 32px ${mode.color}55` }}
        >
          <Icon className="w-9 h-9" style={{ color: mode.color }} strokeWidth={1.6} />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold">{mode.name}</h2>
          {mode.howToPlay && (
            <p className="text-sm text-white/70 mt-3 max-w-xs mx-auto leading-relaxed">{mode.howToPlay}</p>
          )}
        </div>

        <div className="w-full max-w-xs pt-2">
          <div className="flex items-center justify-between gap-3 bg-white/5 rounded-2xl px-4 py-3">
            <div className="text-left">
              <div className="text-sm font-semibold">Spicy content</div>
              <div className="text-xs text-white/50 mt-0.5">Swaps in more explicit statements.</div>
            </div>
            <Switch checked={spicy} onChange={onToggleSpicy} size="small" />
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={onStart} disabled={!isBuilt} className="w-full disabled:cursor-not-allowed">
          Start
        </Button>
        {!isBuilt && (
          <p className="text-center text-xs text-white/50 mt-2">
            We&apos;re building {mode.name} next - check back soon!
          </p>
        )}
        <div className="text-center mt-4">
          <ModeChip mode={mode} onClick={onChangeMode} />
        </div>
      </div>
    </div>
  );
}
