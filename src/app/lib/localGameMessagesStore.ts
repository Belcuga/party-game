import { GameMessage } from '../types/gameMessage';

let idCounter = 1;
const now = () => new Date().toISOString();
const nextId = () => idCounter++;

export const localGameMessages: GameMessage[] = [
  // Most Likely To - sip milestone popups
  { id: nextId(), created_at: now(), category: 'milestone_five', text: '{name} just hit {count} sips - the night is heating up.' },
  { id: nextId(), created_at: now(), category: 'milestone_five', text: "{count} sips down for {name}. Pace yourself... or don't." },
  { id: nextId(), created_at: now(), category: 'milestone_five', text: '{name} is {count} sips deep already.' },
  { id: nextId(), created_at: now(), category: 'milestone_five', text: 'Warming up: {name} just reached {count} sips.' },

  { id: nextId(), created_at: now(), category: 'milestone_ten', text: '{name} just crossed {count} sips. We have a frontrunner.' },
  { id: nextId(), created_at: now(), category: 'milestone_ten', text: '{count} sips for {name} - someone check on them later.' },
  { id: nextId(), created_at: now(), category: 'milestone_ten', text: '{name} hit double digits. Respect.' },
  { id: nextId(), created_at: now(), category: 'milestone_ten', text: 'Uh oh, {name} is at {count}. This is escalating.' },

  { id: nextId(), created_at: now(), category: 'milestone_legend', text: '{name} is at {count} sips. Certified legend of the night.' },
  { id: nextId(), created_at: now(), category: 'milestone_legend', text: '{count} sips and counting for {name} - absolute unit.' },
  { id: nextId(), created_at: now(), category: 'milestone_legend', text: '{name} just broke {count}. Someone get them water.' },
  { id: nextId(), created_at: now(), category: 'milestone_legend', text: '{count} sips deep, {name} is now a cautionary tale.' },

  // Classic Trials - difficulty climb + Turn Up The Heat confirm
  { id: nextId(), created_at: now(), category: 'difficulty_up', text: "Round's heating up - Level {level} unlocked." },
  { id: nextId(), created_at: now(), category: 'difficulty_up', text: 'Everyone brace yourselves. Level {level} starts now.' },
  { id: nextId(), created_at: now(), category: 'difficulty_up', text: 'The questions just got meaner. Welcome to Level {level}.' },
  { id: nextId(), created_at: now(), category: 'difficulty_up', text: 'Level {level}. No more warm-ups.' },

  { id: nextId(), created_at: now(), category: 'heat_confirm', text: 'Locked in - the whole table levels up next round.' },
  { id: nextId(), created_at: now(), category: 'heat_confirm', text: "Buckle up. Everyone's difficulty climbs next round." },
  { id: nextId(), created_at: now(), category: 'heat_confirm', text: 'Requested - every player gets hit harder starting next round.' },
  { id: nextId(), created_at: now(), category: 'heat_confirm', text: 'Done. The whole group jumps a level when this round ends.' },

  // Classic Trials - per-player stat popups
  { id: nextId(), created_at: now(), category: 'stat_top_drinker', text: '{name} is drinking more than anyone else at the table.' },
  { id: nextId(), created_at: now(), category: 'stat_top_drinker', text: "{name}'s in the lead - for sips, not answers." },
  { id: nextId(), created_at: now(), category: 'stat_top_drinker', text: 'Nobody has taken more sips tonight than {name}.' },
  { id: nextId(), created_at: now(), category: 'stat_top_drinker', text: '{name} might want to switch to water. Or not.' },

  { id: nextId(), created_at: now(), category: 'stat_top_answerer', text: '{name} has answered more questions than anyone else.' },
  { id: nextId(), created_at: now(), category: 'stat_top_answerer', text: '{name} is out here actually playing the game.' },
  { id: nextId(), created_at: now(), category: 'stat_top_answerer', text: 'Most honest player of the night: {name}.' },
  { id: nextId(), created_at: now(), category: 'stat_top_answerer', text: "{name} really doesn't want to drink, huh." },

  { id: nextId(), created_at: now(), category: 'stat_heavy_drinker', text: '{name} has taken the easy way out {count} times tonight.' },
  { id: nextId(), created_at: now(), category: 'stat_heavy_drinker', text: "{name} really doesn't like answering questions." },
  { id: nextId(), created_at: now(), category: 'stat_heavy_drinker', text: '{count} sips and zero regrets for {name}.' },
  { id: nextId(), created_at: now(), category: 'stat_heavy_drinker', text: '{name} came here to drink, not to talk.' },

  { id: nextId(), created_at: now(), category: 'stat_heavy_answerer', text: '{name} has answered {count} questions honestly. Respect.' },
  { id: nextId(), created_at: now(), category: 'stat_heavy_answerer', text: '{name} is way too good at this game.' },
  { id: nextId(), created_at: now(), category: 'stat_heavy_answerer', text: '{count} honest answers from {name}. Impressive.' },
  { id: nextId(), created_at: now(), category: 'stat_heavy_answerer', text: "{name} is barely drinking tonight." },

  // Classic Trials - "hasn't drank in a while" reminder before their turn
  { id: nextId(), created_at: now(), category: 'dry_streak', text: "{name}, you haven't taken a sip in a while - take one now." },
  { id: nextId(), created_at: now(), category: 'dry_streak', text: '{name} has answered {count} in a row without drinking. Fix that.' },
  { id: nextId(), created_at: now(), category: 'dry_streak', text: "Suspiciously sober, {name}. Take a sip before this round starts." },
  { id: nextId(), created_at: now(), category: 'dry_streak', text: "{name}'s answer streak is impressive - but it's time for a sip." },
];

export function nextGameMessageId(): number {
  const ids = localGameMessages.map((m) => m.id);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}
