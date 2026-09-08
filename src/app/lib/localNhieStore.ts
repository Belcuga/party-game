import { NhieStatement } from '../types/nhieStatement';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localNhieStatements: NhieStatement[] = [
  { id: nextId(), created_at: now(), statement: 'gone skinny dipping', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'fallen asleep in public', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'sent a text to the wrong person', dirty: false, like_count: 8, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'cried during a movie', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'pretended to be sick to skip work or school', dirty: false, like_count: 7, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: 'gotten a tattoo I regret', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'stalked an ex on social media', dirty: false, like_count: 9, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'lied about my age', dirty: false, like_count: 2, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'gone a full day without checking my phone', dirty: false, like_count: 2, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: 'eaten food off the floor', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'laughed so hard I peed a little', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: "forgotten someone's name right after they told me", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'gotten lost in my own city', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'sung karaoke sober', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'had a one-night stand', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'sent a risky text I immediately regretted', dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'hooked up with someone I met that same night', dirty: true, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: "had a crush on a friend's partner", dirty: true, like_count: 4, dislike_count: 1 },
  { id: nextId(), created_at: now(), statement: "been caught checking someone out by their partner", dirty: true, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), statement: 'used a dating app while in a relationship', dirty: true, like_count: 4, dislike_count: 0 },
];

export function nextNhieId(): number {
  const ids = localNhieStatements.map((s) => s.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function nhieNowIso(): string {
  return now();
}
