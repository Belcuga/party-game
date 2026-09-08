import { WastedPrompt } from '../types/wastedPrompt';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localWastedPrompts: WastedPrompt[] = [
  { id: nextId(), created_at: now(), text: 'Take 2 sips. No excuses.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Chug for 3 seconds straight.', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "Finish what's left in your cup.", dirty: false, like_count: 5, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: 'Everyone stares at you - you drink.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Down your drink halfway. Right now.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Take 3 sips like it\'s nothing.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Refill and take a sip immediately.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "No hands - take a sip using only your mouth.", dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone - you both take a sip together. Cheers!', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick your left neighbor - both of you chug for 3 seconds.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "Pick someone you haven't talked to tonight - drink together.", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone - whoever points at the ceiling last drinks. Then you drink too.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone across the table - toast and drink together.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "Pick someone who's had less to drink than you - even the score, both sip.", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone - arm wrestle. Loser chugs, winner takes a sip anyway.', dirty: false, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick two people - all three of you drink together.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "Pick a 'drinking buddy' for the rest of the game - both drink now to seal it.", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone - rock paper scissors. Loser drinks, then you drink too.', dirty: false, like_count: 4, dislike_count: 0 },

  { id: nextId(), created_at: now(), text: 'Pick someone you find attractive - cheers and drink together.', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "Pick someone you'd take home tonight - both drink.", dirty: true, like_count: 6, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: 'Pick someone - whisper something dirty to them, then both drink.', dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Pick someone to give you a lap dance for 5 seconds. Both drink after.', dirty: true, like_count: 8, dislike_count: 1 },
];

export function nextWastedPromptId(): number {
  const ids = localWastedPrompts.map((p) => p.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
