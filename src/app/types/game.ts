import { Player } from "./player";
import { Question } from "./question";

export type GamePlayer = {
    playerInfo: Player;
    totalQuestionsAnswered: number; // times this player chose "I Answered" instead of drinking
    drankCount: number;             // times this player chose "I Took the Sip(s)" instead of answering
    answerStreak: number;           // consecutive "I Answered" choices since their last drink; resets on drink or reminder
};

export type GameState = {
    players: GamePlayer[];
    questions: Question[];         // All available questions
    answeredQuestionIds: number[];      // Track used questions to avoid repeats
    roundPlayersLeft: string[];         // Player IDs left to answer this round
    currentPlayerId: string | null;
    currentQuestion: Question | null;
    roundNumber: number;
    existingDifficulties: number[];
    tableDifficultyIndex: number;   // index into existingDifficulties (sorted ascending), shared by the whole table
    pendingDifficultyBoost: boolean; // set by the "Turn Up The Heat" button; consumed at the next round transition
    punishmentRouletteEnabled: boolean; // Game Options toggle
};

 export type GameContextType = {
    gameState: GameState | null;
    setGameState: (state: GameState) => void;
  };
