export type DrunkennessLevel = {
  id: string;
  label: string;
  description: string;
};

/** Ordered sober -> wasted. The chosen index maps proportionally onto whatever
 *  difficulty tiers actually exist in the loaded question pool, so the group
 *  starts near the difficulty that matches how the night is already going. */
export const DRUNKENNESS_LEVELS: DrunkennessLevel[] = [
  { id: 'sober', label: 'Sober', description: 'Just getting started' },
  { id: 'buzzed', label: 'Buzzed', description: 'Feeling it a little' },
  { id: 'drunk', label: 'Drunk', description: 'Definitely tipsy' },
  { id: 'wasted', label: 'Wasted', description: 'No holding back' },
];

/** Maps a drunkenness level index onto a starting index into a sorted-ascending
 *  difficulty list of the given length. */
export function startingDifficultyIndex(drunkennessIndex: number, difficultyCount: number): number {
  if (difficultyCount <= 1) return 0;
  const ratio = drunkennessIndex / (DRUNKENNESS_LEVELS.length - 1);
  return Math.round(ratio * (difficultyCount - 1));
}
