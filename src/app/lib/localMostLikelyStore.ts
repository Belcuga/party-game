import { MostLikelyStatement } from '../types/mostLikelyStatement';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localMostLikelyStatements: MostLikelyStatement[] = [
  { id: nextId(), created_at: now(), statement: 'become famous', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'get married first', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'end up in jail for a night', dirty: false, like_count: 8, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'become a millionaire', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'forget their own birthday', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'start a fight over something dumb', dirty: false, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'get lost using GPS', dirty: false, like_count: 5, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: 'become a reality TV star', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'adopt way too many pets', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'cry at a wedding', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'show up late to their own party', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'quit their job on a whim', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'become a cult leader', dirty: false, like_count: 9, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'still be single in ten years', dirty: false, like_count: 4, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: 'marry for money', dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'have a secret admirer in this room', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'send a risky text after a few drinks', dirty: true, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'become someone’s sugar daddy or sugar mommy', dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'hook up with someone in this room someday', dirty: true, like_count: 5, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: 'end up on a reality dating show', dirty: true, like_count: 4, dislike_count: 0 },
];

export function nextMostLikelyId(): number {
  const ids = localMostLikelyStatements.map((s) => s.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function mostLikelyNowIso(): string {
  return now();
}
