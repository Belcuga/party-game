import { GameMessage, GameMessageCategory } from '../types/gameMessage';

/** Replaces {key} placeholders in a template with the given values. */
export function fillTemplate(text: string, vars: Record<string, string> = {}): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.split(`{${key}}`).join(value);
  }
  return result;
}

/** Picks a random message from `pool` in the given category and fills its placeholders. */
export function pickMessage(
  pool: GameMessage[],
  category: GameMessageCategory,
  vars: Record<string, string> = {}
): string {
  const candidates = pool.filter((m) => m.category === category);
  if (candidates.length === 0) return '';
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return fillTemplate(picked.text, vars);
}
