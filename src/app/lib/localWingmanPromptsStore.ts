import { WingmanPrompt } from '../types/wingmanPrompt';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localWingmanPrompts: WingmanPrompt[] = [
  // Type A - {player} plays matchmaker, picks two OTHER players who do something together.
  { id: nextId(), created_at: now(), text: "{player}, pick two other players - they have to compliment each other's eyes, no laughing.", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick two other players - they have to slow dance together for 10 seconds.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, play matchmaker - pick two people who have to hold hands until your next turn.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick two other players - they have to whisper something nice to each other.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick two other players - they have to feed each other a sip of their drink.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, pick two other players - they have to guess something they'd have in common.", dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick two other players - they have to make out for 5 seconds.', dirty: true, like_count: 7, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: "{player}, pick two other players - they have to sit on each other's lap for the next round.", dirty: true, like_count: 6, dislike_count: 0 },

  // Type B - the app auto-pairs {player} with {other}.
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - hold eye contact for 10 seconds, no laughing.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - give each other your best pickup line.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - {player} has to guess three things about {other}.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - dance together for 10 seconds.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - link arms and take your next sip together.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - give them a genuine compliment.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - kiss on the cheek.', dirty: true, like_count: 6, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: '{player} is paired with {other} - whisper something flirty to them.', dirty: true, like_count: 7, dislike_count: 0 },

  // Type C - {player} picks who they interact with themselves.
  { id: nextId(), created_at: now(), text: '{player}, pick someone - give them a genuine compliment.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - stare into their eyes for 10 seconds, no laughing.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - let them pick your next drink.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - hold their hand until your next turn.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - tell them your first impression of them.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone you find attractive here and tell them why.', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - kiss them on the cheek.', dirty: true, like_count: 6, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: '{player}, pick someone - whisper your best pickup line to them.', dirty: true, like_count: 7, dislike_count: 0 },
];

export function nextWingmanPromptId(): number {
  const ids = localWingmanPrompts.map((p) => p.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
