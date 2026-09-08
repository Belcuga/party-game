import { CategoryPrompt } from '../types/categoryPrompt';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localCategoryPrompts: CategoryPrompt[] = [
  { id: nextId(), created_at: now(), text: 'Name 8 football clubs from England.', count: 8, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 8 car brands.', count: 8, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 types of cocktails.', count: 6, dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 movies from the 90s.', count: 6, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 10 fruits.', count: 10, dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 7 superheroes.', count: 7, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 fast food chains.', count: 6, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 Disney movies.', count: 6, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 sports.', count: 6, dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 board games.', count: 5, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 types of cheese.', count: 5, dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 cities that start with the letter B.', count: 5, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 dance moves.', count: 5, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 7 famous singers.', count: 7, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 6 horror movies.', count: 6, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 8 things you find in a kitchen.', count: 8, dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 celebrity couples.', count: 5, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 7 cartoon characters.', count: 7, dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 jobs you would never want.', count: 5, dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 things you shouldn’t say to your boss.', count: 5, dirty: false, like_count: 5, dislike_count: 0 },

  { id: nextId(), created_at: now(), text: 'Name 5 positions from the Kama Sutra.', count: 5, dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 body parts people are self-conscious about.', count: 5, dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 10 slang words for being drunk.', count: 10, dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: 'Name 5 reasons someone would leave a date early.', count: 5, dirty: true, like_count: 6, dislike_count: 1 },
  { id: nextId(), created_at: now(), text: 'Name 8 slang words for a body part.', count: 8, dirty: true, like_count: 7, dislike_count: 0 },
];

export function nextCategoryPromptId(): number {
  const ids = localCategoryPrompts.map((p) => p.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function categoryNowIso(): string {
  return now();
}
