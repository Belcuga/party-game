-- Punishment Roulette rules
create table if not exists roulette_effects (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  label text not null,
  description text not null
);

alter table roulette_effects enable row level security;
create policy "Public read" on roulette_effects for select using (true);
create policy "Public insert" on roulette_effects for insert with check (true);
create policy "Public update" on roulette_effects for update using (true) with check (true);
create policy "Public delete" on roulette_effects for delete using (true);

insert into roulette_effects (label, description) values
('Say "banana" first', '{player} must say "banana" before every sentence until their next turn. Forget? Take a sip.'),
('Can''t say their name', '{player} can''t say their own name until their next turn. Slip up? Take a sip.'),
('Talks in third person', '{player} can only speak in third person until their next turn. Forget? Take a sip.'),
('Can''t laugh', '{player} can''t laugh or smile until their next turn. Crack up? Take a sip.'),
('Ends with a catchphrase', '{player} must end every sentence with "...if you know what I mean" until their next turn. Forget? Take a sip.'),
('Stands to talk', '{player} has to stand up every time they talk until their next turn. Forget? Take a sip.'),
('Can''t touch their phone', '{player} can''t touch their phone until their next turn. Caught? Take a sip.'),
('Impersonates someone', '{player}: pick someone at the table - talk like them every time you speak, until your next turn. Forget? Take a sip.'),
('Chug!', '{player} chugs their drink. Right now.'),
('Double sip', '{player} takes a double sip. Right now.'),
('Linked with someone', '{player}: pick someone at the table - for your next 3 turns, whenever either of you drinks, you both drink.'),
('Gifts a drink', '{player}: pick someone at the table - they take a sip. Right now.'),
('Gives a nickname', '{player}: pick someone at the table and give them a nickname for the rest of the game. Anyone who calls them by their real name instead takes a sip.');

-- Fun popup messages (sip milestones, difficulty climbs, per-player stat popups)
create table if not exists game_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  category text not null check (category in (
    'milestone_five', 'milestone_ten', 'milestone_legend',
    'difficulty_up', 'heat_confirm',
    'stat_top_drinker', 'stat_top_answerer', 'stat_heavy_drinker', 'stat_heavy_answerer'
  )),
  text text not null
);

alter table game_messages enable row level security;
create policy "Public read" on game_messages for select using (true);
create policy "Public insert" on game_messages for insert with check (true);
create policy "Public update" on game_messages for update using (true) with check (true);
create policy "Public delete" on game_messages for delete using (true);

insert into game_messages (category, text) values
('milestone_five', '{name} just hit {count} sips - the night is heating up.'),
('milestone_five', '{count} sips down for {name}. Pace yourself... or don''t.'),
('milestone_five', '{name} is {count} sips deep already.'),
('milestone_five', 'Warming up: {name} just reached {count} sips.'),

('milestone_ten', '{name} just crossed {count} sips. We have a frontrunner.'),
('milestone_ten', '{count} sips for {name} - someone check on them later.'),
('milestone_ten', '{name} hit double digits. Respect.'),
('milestone_ten', 'Uh oh, {name} is at {count}. This is escalating.'),

('milestone_legend', '{name} is at {count} sips. Certified legend of the night.'),
('milestone_legend', '{count} sips and counting for {name} - absolute unit.'),
('milestone_legend', '{name} just broke {count}. Someone get them water.'),
('milestone_legend', '{count} sips deep, {name} is now a cautionary tale.'),

('difficulty_up', 'Round''s heating up - Level {level} unlocked.'),
('difficulty_up', 'Everyone brace yourselves. Level {level} starts now.'),
('difficulty_up', 'The questions just got meaner. Welcome to Level {level}.'),
('difficulty_up', 'Level {level}. No more warm-ups.'),

('heat_confirm', 'Locked in - the whole table levels up next round.'),
('heat_confirm', 'Buckle up. Everyone''s difficulty climbs next round.'),
('heat_confirm', 'Requested - every player gets hit harder starting next round.'),
('heat_confirm', 'Done. The whole group jumps a level when this round ends.'),

('stat_top_drinker', '{name} is drinking more than anyone else at the table.'),
('stat_top_drinker', '{name}''s in the lead - for sips, not answers.'),
('stat_top_drinker', 'Nobody has taken more sips tonight than {name}.'),
('stat_top_drinker', '{name} might want to switch to water. Or not.'),

('stat_top_answerer', '{name} has answered more questions than anyone else.'),
('stat_top_answerer', '{name} is out here actually playing the game.'),
('stat_top_answerer', 'Most honest player of the night: {name}.'),
('stat_top_answerer', '{name} really doesn''t want to drink, huh.'),

('stat_heavy_drinker', '{name} has taken the easy way out {count} times tonight.'),
('stat_heavy_drinker', '{name} really doesn''t like answering questions.'),
('stat_heavy_drinker', '{count} sips and zero regrets for {name}.'),
('stat_heavy_drinker', '{name} came here to drink, not to talk.'),

('stat_heavy_answerer', '{name} has answered {count} questions honestly. Respect.'),
('stat_heavy_answerer', '{name} is way too good at this game.'),
('stat_heavy_answerer', '{count} honest answers from {name}. Impressive.'),
('stat_heavy_answerer', '{name} is barely drinking tonight.');
