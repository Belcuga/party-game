export type TruthDarePrompt = {
  id: number;
  created_at: string;
  type: 'truth' | 'dare';
  text: string;
  dirty: boolean;
  like_count: number;
  dislike_count: number;
};
