import { Question } from '../types/question';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localQuestions: Question[] = [
  { id: nextId(), created_at: now(), question: 'Ko je najverovatnije da započne ples na sred sobe?', dirty: false, challenge: false, punishment: 1, like_count: 3, dislike_count: 0, difficulty: 1, all_players: false, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Koji je tvoj najneugodniji trenutak na nekom tulumu?', dirty: false, challenge: false, punishment: 1, like_count: 5, dislike_count: 1, difficulty: 1, all_players: false, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Popij gutljaj ako si ikada zaspao/la na tuđoj zabavi.', dirty: false, challenge: true, punishment: 2, like_count: 2, dislike_count: 0, difficulty: 2, all_players: true, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Ko za stolom najviše voli da bude centar pažnje?', dirty: false, challenge: false, punishment: 1, like_count: 4, dislike_count: 0, difficulty: 2, all_players: false, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Opiši svoj najgori "spoj na slepo" u tri reči.', dirty: true, challenge: false, punishment: 2, like_count: 6, dislike_count: 2, difficulty: 3, all_players: false, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Zagrli osobu suprotnog pola pored sebe.', dirty: true, challenge: true, punishment: 1, like_count: 1, dislike_count: 0, difficulty: 3, all_players: false, need_opposite_gender: true },
  { id: nextId(), created_at: now(), question: 'Ko bi prvi pobegao iz sobe da vidi pauka?', dirty: false, challenge: false, punishment: 1, like_count: 2, dislike_count: 0, difficulty: 1, all_players: false, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Svi igrači popiju gutljaj u čast najgore žurke ove godine.', dirty: false, challenge: true, punishment: 3, like_count: 3, dislike_count: 0, difficulty: 2, all_players: true, need_opposite_gender: false },
  { id: nextId(), created_at: now(), question: 'Ko je od prisutnih poslednji proveravao telefon? Ta osoba popije gutljaj.', dirty: false, challenge: false, punishment: 1, like_count: 2, dislike_count: 0, difficulty: 1, all_players: true, need_opposite_gender: false },
];

export function nextQuestionId(): number {
  const ids = localQuestions.map((q) => q.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

export function nowIso(): string {
  return now();
}
