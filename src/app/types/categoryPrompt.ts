export type CategoryPrompt = {
  id: number;
  created_at: string;
  text: string;
  /** How many items the player must name before time runs out (e.g. 5-10). */
  count: number;
  dirty: boolean;
  like_count: number;
  dislike_count: number;
};
