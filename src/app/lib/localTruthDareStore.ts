import { TruthDarePrompt } from '../types/truthDarePrompt';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localTruthDarePrompts: TruthDarePrompt[] = [
  { id: nextId(), created_at: now(), type: 'truth', text: "What's the most embarrassing thing in your search history?", dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: 'What\'s a lie you told that almost got you caught?', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: 'Who in this room would you trust with a secret?', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: "What's your most irrational fear?", dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: "What's the pettiest reason you've ever been mad at someone?", dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: "What's a rumor you've heard about yourself?", dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: "What's the worst gift you've ever received?", dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: 'Who was your worst kiss?', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: 'What\'s the most attractive thing about the person to your right?', dirty: true, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'truth', text: 'Have you ever had a crush on someone in this room?', dirty: true, like_count: 8, dislike_count: 1 },

  { id: nextId(), created_at: now(), type: 'dare', text: 'Do your best impression of someone in the room.', dirty: false, like_count: 6, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Let the group post anything they want on your social media.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Talk in an accent for the next 3 rounds.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Do 10 pushups right now.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Let someone draw on your face with a pen.', dirty: false, like_count: 5, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Sing the chorus of your most embarrassing favorite song.', dirty: false, like_count: 4, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Try to make someone else laugh without touching them.', dirty: false, like_count: 3, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Give someone in the room a lap dance for 10 seconds.', dirty: true, like_count: 6, dislike_count: 1 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Take a body shot off someone.', dirty: true, like_count: 7, dislike_count: 0 },
  { id: nextId(), created_at: now(), type: 'dare', text: 'Whisper something flirty to the person on your left.', dirty: true, like_count: 5, dislike_count: 0 },
];

export function nextTruthDareId(): number {
  const ids = localTruthDarePrompts.map((p) => p.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function truthDareNowIso(): string {
  return now();
}
