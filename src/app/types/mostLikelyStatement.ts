export type MostLikelyStatement = {
  id: number;
  created_at: string;
  /** The tail of the sentence, e.g. "become famous" - the UI prepends "Most likely to". */
  statement: string;
  dirty: boolean;
  like_count: number;
  dislike_count: number;
};
