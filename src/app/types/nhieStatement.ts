export type NhieStatement = {
  id: number;
  created_at: string;
  /** The tail of the sentence, e.g. "gone skinny dipping" - the UI prepends "Never have I ever". */
  statement: string;
  dirty: boolean;
  like_count: number;
  dislike_count: number;
};
