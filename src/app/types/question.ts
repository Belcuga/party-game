/**
 * Content guide for writing Classic Trials questions:
 *
 * difficulty (1-4) - how socially/emotionally intense the question or dare is:
 *   1 Icebreaker - safe, silly, everyone's comfortable.
 *   2 Personal   - a bit revealing/embarrassing; mild `challenge` dares fit here.
 *   3 Bold       - real vulnerability or a physical dare; most `dirty` and
 *                  `need_opposite_gender` questions (kiss, hug...) belong here.
 *   4 Extreme    - biggest dares, usually `dirty` + `challenge` combined.
 *
 * punishment (1-3) - sips owed for skipping/not answering, independent of difficulty:
 *   1 sip  - default for most questions.
 *   2 sips - easy to fake/skip, so the cost needs to sting more; also the norm
 *            for `all_players` bonus questions.
 *   3 sips - the biggest dares, typically difficulty 3-4.
 *   Rule of thumb: difficulty 1->1, 2->1-2, 3->2-3, 4->3, then use judgment.
 *
 * need_opposite_gender - set true for any question requiring a real opposite-gender
 * interaction (kiss, hug, compliment...), whether or not the text uses ${player}.
 * The game only offers these to a player who is themselves marked single, and only
 * when an eligible single opposite-gender partner is present at the table.
 */
export type Question = {
    id: number;
    created_at: string;
    question: string;
    dirty: boolean;
    challenge: boolean;
    punishment: number;
    like_count: number;
    dislike_count: number;
    difficulty: number;
    all_players: boolean;
    need_opposite_gender: boolean;
};
