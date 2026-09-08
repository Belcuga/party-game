import { BondingQuestion } from '../types/bondingQuestion';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localBondingQuestions: BondingQuestion[] = [
  // Generic personal questions - {player} is whoever was picked to answer.
  { id: nextId(), created_at: now(), text: "{player}, what's the happiest memory from your childhood?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's something you're really proud of but rarely talk about?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, what are you most afraid of?', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's a moment that changed how you see life?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, who has influenced you the most, and how?', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's something you wish people understood about you?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's a fear you've overcome that you're proud of?", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, what does true friendship mean to you?', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's the kindest thing anyone has ever done for you?", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's something you've never told anyone at this table?", dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's a regret you've made peace with?", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, when do you feel most like yourself?', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's the best piece of advice you've ever received?", dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's something you're still figuring out about yourself?", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, what do you value most in the people you keep close?', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's a relationship (any kind) that shaped who you are today?", dirty: true, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's the most vulnerable you've ever let yourself be with someone?", dirty: true, like_count: 5, dislike_count: 0 },

  // Third-player questions - {player} answers, {other} is a random different player.
  { id: nextId(), created_at: now(), text: '{player}, what was your first impression when you met {other}?', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's one thing you admire about {other}?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, describe {other} in three words.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, what do you think {other} is secretly really good at?', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: "{player}, what's a memory you have with {other} that you still think about?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, if {other} was a movie character, who would they be and why?', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), text: '{player}, what do you think {other} needs to hear more often?', dirty: false, like_count: 5, dislike_count: 0 },
];

export function nextBondingQuestionId(): number {
  const ids = localBondingQuestions.map((q) => q.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
