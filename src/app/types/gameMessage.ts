/**
 * Every "fun popup" message pool in the app, collapsed into one admin-editable table.
 * `text` may use {name}/{count}/{level} placeholders depending on the category - see each
 * category's call site for which ones apply.
 */
export type GameMessageCategory =
  | 'milestone_five'
  | 'milestone_ten'
  | 'milestone_legend'
  | 'difficulty_up'
  | 'heat_confirm'
  | 'stat_top_drinker'
  | 'stat_top_answerer'
  | 'stat_heavy_drinker'
  | 'stat_heavy_answerer';

export type GameMessage = {
  id: number;
  created_at: string;
  category: GameMessageCategory;
  text: string;
};
