'use client';

import { Layers, Hand, Users, Shield, Timer, Skull, Check, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import Button from '../ui/Button';

export type GameModeId =
  | 'classic'
  | 'never'
  | 'mostlikely'
  | 'truthdare'
  | 'category'
  | 'wasted';

export type Mode = {
  id: GameModeId;
  name: string;
  tagline: string;
  color: string;
  icon: LucideIcon;
  /** Whether this mode needs a named player roster (turn order, voting, per-player drink type)
   *  or just runs as a shared prompt the whole table answers together. */
  needsRoster: boolean;
  /** Plain-language explanation of how a round of this mode plays out, shown on its lobby screen. */
  howToPlay?: string;
  /** Route to the built gameplay screen, once it exists. Undefined = not built yet. */
  route?: string;
  /** For roster modes: 'name-only' skips gender/drink/single (not needed by this mode's mechanic).
   *  Undefined/'full' uses the classic name+gender+drink+single form. */
  rosterFields?: 'full' | 'name-only';
  /** True for modes whose design/build hasn't happened yet - shown greyed out and unselectable. */
  comingSoon?: boolean;
};

export const GAME_MODES: Mode[] = [
  {
    id: 'classic',
    name: 'Classic Trials',
    tagline: 'Answer questions and take on challenges - difficulty climbs every round.',
    color: '#00E676',
    icon: Layers,
    needsRoster: true,
    howToPlay: 'Each round, everyone gets one question or dare - answer it or take the sips shown. Difficulty climbs as the night goes on, and anyone can hit Turn Up The Heat to speed that up.',
  },
  {
    id: 'never',
    name: 'Never Have I Ever',
    tagline: "If you've done it, you're drinking.",
    color: '#ff6fd8',
    icon: Hand,
    needsRoster: false,
    howToPlay: "Read the statement out loud. If you've done it, you drink - no tapping, just honesty.",
    route: '/game/never',
  },
  {
    id: 'mostlikely',
    name: 'Most Likely To',
    tagline: 'The group votes - whoever gets picked, drinks.',
    color: '#9156f3',
    icon: Users,
    needsRoster: true,
    rosterFields: 'name-only',
    howToPlay: 'Read the statement, then everyone points at whoever fits it best. Tap that person to lock it in - they drink.',
    route: '/game/mostlikely',
  },
  {
    id: 'truthdare',
    name: 'Truth or Dare',
    tagline: 'You choose your own fate.',
    color: '#ffb703',
    icon: Shield,
    needsRoster: true,
    rosterFields: 'name-only',
    howToPlay: "Each round, everyone gets a turn to ask someone - usually the app picks fairly, but sometimes you'll get to choose yourself. Ask 'Truth or Dare?' and make one up, or tap Suggest if you're stuck. Can't do it? Take a sip.",
    route: '/game/truthdare',
  },
  {
    id: 'category',
    name: 'Category Countdown',
    tagline: 'Name it fast, or take a sip.',
    color: '#2dd4bf',
    icon: Timer,
    needsRoster: true,
    rosterFields: 'name-only',
    howToPlay: 'Each turn you get a category asking for several things - name them out loud, tapping the button once for each one, before time runs out. Get them all before the clock hits zero, or take a sip.',
    route: '/game/category',
  },
  {
    id: 'wasted',
    name: 'Get Wasted',
    tagline: 'No excuses - everyone drinks, every turn.',
    color: '#ef4444',
    icon: Skull,
    needsRoster: true,
    rosterFields: 'name-only',
    howToPlay: "Each turn, everyone gets a prompt - some are solo, some tell you to pick someone else at the table. Either way, drinking isn't optional here. No answering out of it.",
    route: '/game/wasted',
  },
];

type Props = {
  selectedModeId: GameModeId | null;
  onSelect: (id: GameModeId) => void;
  onContinue: () => void;
};

export function ModeChip({ mode, onClick }: { mode: Mode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-white/10 border cursor-pointer"
      style={{ borderColor: mode.color }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: mode.color }} />
      <span className="text-xs font-semibold">{mode.name}</span>
      <span className="text-xs text-white/50">Change</span>
    </button>
  );
}

export default function ModeSelect({ selectedModeId, onSelect, onContinue }: Props) {
  return (
    <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
      <div className="text-center mb-4">
        <h2 className="text-xl font-semibold">Choose Your Mode</h2>
        <p className="text-sm text-white/60 mt-1">Pick how tonight&apos;s game plays out.</p>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
      <ul className="space-y-2">
        {GAME_MODES.map((mode) => {
          const selected = selectedModeId === mode.id;
          const Icon = mode.icon;
          return (
            <li key={mode.id}>
              <button
                onClick={() => !mode.comingSoon && onSelect(mode.id)}
                disabled={mode.comingSoon}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-colors',
                  mode.comingSoon
                    ? 'opacity-40 cursor-not-allowed'
                    : clsx('cursor-pointer', selected ? 'bg-white/10' : 'bg-white/5 hover:bg-white/[0.08]')
                )}
                style={{ borderColor: selected && !mode.comingSoon ? mode.color : 'rgba(255,255,255,0.1)' }}
              >
                <span
                  className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border bg-white/5"
                  style={{ borderColor: mode.color }}
                >
                  <Icon className="w-5 h-5" style={{ color: mode.color }} strokeWidth={1.8} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="block font-bold text-sm">{mode.name}</span>
                    {mode.comingSoon && (
                      <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                        Coming Soon
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-white/60 mt-0.5 leading-snug">{mode.tagline}</span>
                </span>
                {!mode.comingSoon && (
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center"
                    style={{
                      borderColor: selected ? mode.color : 'rgba(255,255,255,0.25)',
                      backgroundColor: selected ? mode.color : 'transparent',
                    }}
                  >
                    {selected && <Check className="w-3 h-3 text-[#0c0018]" strokeWidth={3} />}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      </div>

      <div className="pt-4">
        <Button onClick={onContinue} disabled={!selectedModeId} className="w-full disabled:cursor-not-allowed">
          Continue
        </Button>
      </div>
    </div>
  );
}
