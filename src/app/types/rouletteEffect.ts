export type RouletteEffect = {
  id: number;
  created_at: string;
  /** Short label used while the reveal is spinning through options. */
  label: string;
  /** Full instruction shown once the spin lands, including how long it lasts. Supports {player}. */
  description: string;
};
