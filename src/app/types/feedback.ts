export type Feedback = {
  id: number;
  created_at: string;
  type: 'bug' | 'improvement';
  message: string;
  email: string | null;
  read: boolean;
};
