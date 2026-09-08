-- Classic Trials: "hasn't drank in a while" reminder before a player's turn.
alter table game_messages drop constraint game_messages_category_check;
alter table game_messages add constraint game_messages_category_check check (category in (
  'milestone_five', 'milestone_ten', 'milestone_legend',
  'difficulty_up', 'heat_confirm',
  'stat_top_drinker', 'stat_top_answerer', 'stat_heavy_drinker', 'stat_heavy_answerer',
  'dry_streak'
));

insert into game_messages (category, text) values
('dry_streak', '{name}, you haven''t taken a sip in a while - take one now.'),
('dry_streak', '{name} has answered {count} in a row without drinking. Fix that.'),
('dry_streak', 'Suspiciously sober, {name}. Take a sip before this round starts.'),
('dry_streak', '{name}''s answer streak is impressive - but it''s time for a sip.');
