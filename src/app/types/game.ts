import { Drink, Gender } from "./player";

export type GamePlayer = {
    id: string;                 // Player UUID
    name: string;
    gender: Gender;
    skipCount: number;
    drink: Drink;
    difficultyQueue: number[];   // 4 difficulties shuffled
    difficultyIndex: number;     // where in difficultyQueue they currently are
    totalQuestionsAnswered: number; // counts questions for bonus round + skip bonus
};

export type GameState = {
    players: GamePlayer[];
    questions: Question[];         // All available questions
    answeredQuestionIds: number[];      // Track used questions to avoid repeats
    roundPlayersLeft: string[];         // Player IDs left to answer this round
    currentPlayerId: string | null;
    currentQuestion: Question | null;
    roundNumber: number;
    bonusReady: boolean;                // Ready for bonus round (all_players = true)
};