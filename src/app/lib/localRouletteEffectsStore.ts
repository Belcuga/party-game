import { RouletteEffect } from '../types/rouletteEffect';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localRouletteEffects: RouletteEffect[] = [
  {
    id: nextId(),
    created_at: now(),
    label: 'Say "banana" first',
    description: '{player} must say "banana" before every sentence until their next turn. Forget? Take a sip.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: "Can't say their name",
    description: "{player} can't say their own name until their next turn. Slip up? Take a sip.",
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Talks in third person',
    description: '{player} can only speak in third person until their next turn. Forget? Take a sip.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: "Can't laugh",
    description: "{player} can't laugh or smile until their next turn. Crack up? Take a sip.",
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Ends with a catchphrase',
    description: '{player} must end every sentence with "...if you know what I mean" until their next turn. Forget? Take a sip.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Stands to talk',
    description: '{player} has to stand up every time they talk until their next turn. Forget? Take a sip.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: "Can't touch their phone",
    description: "{player} can't touch their phone until their next turn. Caught? Take a sip.",
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Impersonates someone',
    description: '{player}: pick someone at the table - talk like them every time you speak, until your next turn. Forget? Take a sip.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Chug!',
    description: '{player} chugs their drink. Right now.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Double sip',
    description: '{player} takes a double sip. Right now.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Linked with someone',
    description: "{player}: pick someone at the table - for your next 3 turns, whenever either of you drinks, you both drink.",
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Gifts a drink',
    description: '{player}: pick someone at the table - they take a sip. Right now.',
  },
  {
    id: nextId(),
    created_at: now(),
    label: 'Gives a nickname',
    description: '{player}: pick someone at the table and give them a nickname for the rest of the game. Anyone who calls them by their real name instead takes a sip.',
  },
];

export function nextRouletteEffectId(): number {
  const ids = localRouletteEffects.map((e) => e.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
