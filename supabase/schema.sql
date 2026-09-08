-- Tipsy Trials - Supabase schema
--
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query)
-- after creating the project. It creates all 9 tables the app already talks to via
-- supabase.from('<table>')... (see src/app/lib/SupabaseClient.ts), enables Row Level
-- Security, and seeds each content table with the same starter content the app currently
-- ships with locally.
--
-- IMPORTANT - security note:
-- This app has no real user accounts yet. The admin panel (/admin) is only gated by a
-- passcode checked in the browser - it is NOT enforced by Supabase. The policies below are
-- intentionally permissive (anyone with the anon key can read/write every table) so the app
-- keeps working exactly as it does today once you switch it over. If you later add real
-- Supabase Auth for the admin panel, come back and tighten the insert/update/delete policies
-- to require an authenticated admin role instead of `using (true)`.

-- ============================================================================
-- Classic Trials questions
-- ============================================================================
create table if not exists questions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  question text not null,
  dirty boolean not null default false,
  challenge boolean not null default false,
  punishment smallint not null default 1,
  like_count integer not null default 0,
  dislike_count integer not null default 0,
  difficulty smallint not null default 1,
  all_players boolean not null default false,
  need_opposite_gender boolean not null default false
);

alter table questions enable row level security;
create policy "Public read" on questions for select using (true);
create policy "Public insert" on questions for insert with check (true);
create policy "Public update" on questions for update using (true) with check (true);
create policy "Public delete" on questions for delete using (true);

insert into questions (question, dirty, challenge, punishment, like_count, dislike_count, difficulty, all_players, need_opposite_gender) values
('Ko je najverovatnije da započne ples na sred sobe?', false, false, 1, 3, 0, 1, false, false),
('Koji je tvoj najneugodniji trenutak na nekom tulumu?', false, false, 1, 5, 1, 1, false, false),
('Popij gutljaj ako si ikada zaspao/la na tuđoj zabavi.', false, true, 2, 2, 0, 2, true, false),
('Ko za stolom najviše voli da bude centar pažnje?', false, false, 1, 4, 0, 2, false, false),
('Opiši svoj najgori "spoj na slepo" u tri reči.', true, false, 2, 6, 2, 3, false, false),
('Zagrli osobu suprotnog pola pored sebe.', true, true, 1, 1, 0, 3, false, true),
('Ko bi prvi pobegao iz sobe da vidi pauka?', false, false, 1, 2, 0, 1, false, false),
('Svi igrači popiju gutljaj u čast najgore žurke ove godine.', false, true, 3, 3, 0, 2, true, false),
('Ko je od prisutnih poslednji proveravao telefon? Ta osoba popije gutljaj.', false, false, 1, 2, 0, 1, true, false);

-- ============================================================================
-- Never Have I Ever statements
-- ============================================================================
create table if not exists nhie_statements (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  statement text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table nhie_statements enable row level security;
create policy "Public read" on nhie_statements for select using (true);
create policy "Public insert" on nhie_statements for insert with check (true);
create policy "Public update" on nhie_statements for update using (true) with check (true);
create policy "Public delete" on nhie_statements for delete using (true);

insert into nhie_statements (statement, dirty, like_count, dislike_count) values
('gone skinny dipping', false, 6, 0),
('fallen asleep in public', false, 4, 0),
('sent a text to the wrong person', false, 8, 0),
('cried during a movie', false, 3, 0),
('pretended to be sick to skip work or school', false, 7, 1),
('gotten a tattoo I regret', false, 3, 0),
('stalked an ex on social media', false, 9, 0),
('lied about my age', false, 2, 0),
('gone a full day without checking my phone', false, 2, 1),
('eaten food off the floor', false, 5, 0),
('laughed so hard I peed a little', false, 6, 0),
('forgotten someone''s name right after they told me', false, 4, 0),
('gotten lost in my own city', false, 3, 0),
('sung karaoke sober', false, 5, 0),
('had a one-night stand', true, 7, 0),
('sent a risky text I immediately regretted', true, 6, 0),
('hooked up with someone I met that same night', true, 5, 0),
('had a crush on a friend''s partner', true, 4, 1),
('been caught checking someone out by their partner', true, 3, 0),
('used a dating app while in a relationship', true, 4, 0);

-- ============================================================================
-- Most Likely To statements
-- ============================================================================
create table if not exists most_likely_statements (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  statement text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table most_likely_statements enable row level security;
create policy "Public read" on most_likely_statements for select using (true);
create policy "Public insert" on most_likely_statements for insert with check (true);
create policy "Public update" on most_likely_statements for update using (true) with check (true);
create policy "Public delete" on most_likely_statements for delete using (true);

insert into most_likely_statements (statement, dirty, like_count, dislike_count) values
('become famous', false, 6, 0),
('get married first', false, 5, 0),
('end up in jail for a night', false, 8, 0),
('become a millionaire', false, 4, 0),
('forget their own birthday', false, 3, 0),
('start a fight over something dumb', false, 7, 0),
('get lost using GPS', false, 5, 1),
('become a reality TV star', false, 6, 0),
('adopt way too many pets', false, 4, 0),
('cry at a wedding', false, 3, 0),
('show up late to their own party', false, 5, 0),
('quit their job on a whim', false, 4, 0),
('become a cult leader', false, 9, 0),
('still be single in ten years', false, 4, 1),
('marry for money', true, 6, 0),
('have a secret admirer in this room', true, 7, 0),
('send a risky text after a few drinks', true, 5, 0),
('become someone''s sugar daddy or sugar mommy', true, 6, 0),
('hook up with someone in this room someday', true, 5, 1),
('end up on a reality dating show', true, 4, 0);

-- ============================================================================
-- Truth or Dare prompts
-- ============================================================================
create table if not exists truth_dare_prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in ('truth', 'dare')),
  text text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table truth_dare_prompts enable row level security;
create policy "Public read" on truth_dare_prompts for select using (true);
create policy "Public insert" on truth_dare_prompts for insert with check (true);
create policy "Public update" on truth_dare_prompts for update using (true) with check (true);
create policy "Public delete" on truth_dare_prompts for delete using (true);

insert into truth_dare_prompts (type, text, dirty, like_count, dislike_count) values
('truth', 'What''s the most embarrassing thing in your search history?', false, 6, 0),
('truth', 'What''s a lie you told that almost got you caught?', false, 5, 0),
('truth', 'Who in this room would you trust with a secret?', false, 4, 0),
('truth', 'What''s your most irrational fear?', false, 3, 0),
('truth', 'What''s the pettiest reason you''ve ever been mad at someone?', false, 5, 0),
('truth', 'What''s a rumor you''ve heard about yourself?', false, 4, 0),
('truth', 'What''s the worst gift you''ve ever received?', false, 3, 0),
('truth', 'Who was your worst kiss?', true, 7, 0),
('truth', 'What''s the most attractive thing about the person to your right?', true, 6, 0),
('truth', 'Have you ever had a crush on someone in this room?', true, 8, 1),
('dare', 'Do your best impression of someone in the room.', false, 6, 0),
('dare', 'Let the group post anything they want on your social media.', false, 5, 0),
('dare', 'Talk in an accent for the next 3 rounds.', false, 4, 0),
('dare', 'Do 10 pushups right now.', false, 3, 0),
('dare', 'Let someone draw on your face with a pen.', false, 5, 0),
('dare', 'Sing the chorus of your most embarrassing favorite song.', false, 4, 0),
('dare', 'Try to make someone else laugh without touching them.', false, 3, 0),
('dare', 'Give someone in the room a lap dance for 10 seconds.', true, 6, 1),
('dare', 'Take a body shot off someone.', true, 7, 0),
('dare', 'Whisper something flirty to the person on your left.', true, 5, 0);

-- ============================================================================
-- Category Countdown categories
-- ============================================================================
create table if not exists category_prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  text text not null,
  count smallint not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table category_prompts enable row level security;
create policy "Public read" on category_prompts for select using (true);
create policy "Public insert" on category_prompts for insert with check (true);
create policy "Public update" on category_prompts for update using (true) with check (true);
create policy "Public delete" on category_prompts for delete using (true);

insert into category_prompts (text, count, dirty, like_count, dislike_count) values
('Name 8 football clubs from England.', 8, false, 5, 0),
('Name 8 car brands.', 8, false, 4, 0),
('Name 6 types of cocktails.', 6, false, 6, 0),
('Name 6 movies from the 90s.', 6, false, 5, 0),
('Name 10 fruits.', 10, false, 3, 0),
('Name 7 superheroes.', 7, false, 5, 0),
('Name 6 fast food chains.', 6, false, 4, 0),
('Name 6 Disney movies.', 6, false, 4, 0),
('Name 6 sports.', 6, false, 3, 0),
('Name 5 board games.', 5, false, 4, 0),
('Name 5 types of cheese.', 5, false, 3, 0),
('Name 5 cities that start with the letter B.', 5, false, 5, 0),
('Name 5 dance moves.', 5, false, 4, 0),
('Name 7 famous singers.', 7, false, 4, 0),
('Name 6 horror movies.', 6, false, 4, 0),
('Name 8 things you find in a kitchen.', 8, false, 3, 0),
('Name 5 celebrity couples.', 5, false, 5, 0),
('Name 7 cartoon characters.', 7, false, 4, 0),
('Name 5 jobs you would never want.', 5, false, 5, 0),
('Name 5 things you shouldn''t say to your boss.', 5, false, 5, 0),
('Name 5 positions from the Kama Sutra.', 5, true, 7, 0),
('Name 5 body parts people are self-conscious about.', 5, true, 6, 0),
('Name 10 slang words for being drunk.', 10, true, 6, 0),
('Name 5 reasons someone would leave a date early.', 5, true, 6, 1),
('Name 8 slang words for a body part.', 8, true, 7, 0);

-- ============================================================================
-- User feedback (bug reports & improvement suggestions) - no seed data, starts empty
-- ============================================================================
create table if not exists feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  type text not null check (type in ('bug', 'improvement')),
  message text not null,
  email text,
  read boolean not null default false
);

alter table feedback enable row level security;
create policy "Public read" on feedback for select using (true);
create policy "Public insert" on feedback for insert with check (true);
create policy "Public update" on feedback for update using (true) with check (true);
create policy "Public delete" on feedback for delete using (true);

-- ============================================================================
-- Punishment Roulette rules
-- ============================================================================
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

-- ============================================================================
-- Fun popup messages (sip milestones, difficulty climbs, per-player stat popups)
-- ============================================================================
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

-- Get Wasted prompts
create table if not exists wasted_prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  text text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table wasted_prompts enable row level security;
create policy "Public read" on wasted_prompts for select using (true);
create policy "Public insert" on wasted_prompts for insert with check (true);
create policy "Public update" on wasted_prompts for update using (true) with check (true);
create policy "Public delete" on wasted_prompts for delete using (true);

insert into wasted_prompts (text, dirty, like_count, dislike_count) values
('Take 2 sips. No excuses.', false, 4, 0),
('Chug for 3 seconds straight.', false, 6, 0),
('Finish what''s left in your cup.', false, 5, 1),
('Everyone stares at you - you drink.', false, 3, 0),
('Down your drink halfway. Right now.', false, 5, 0),
('Take 3 sips like it''s nothing.', false, 3, 0),
('Refill and take a sip immediately.', false, 4, 0),
('No hands - take a sip using only your mouth.', false, 6, 0),
('Pick someone - you both take a sip together. Cheers!', false, 6, 0),
('Pick your left neighbor - both of you chug for 3 seconds.', false, 5, 0),
('Pick someone you haven''t talked to tonight - drink together.', false, 4, 0),
('Pick someone - whoever points at the ceiling last drinks. Then you drink too.', false, 5, 0),
('Pick someone across the table - toast and drink together.', false, 4, 0),
('Pick someone who''s had less to drink than you - even the score, both sip.', false, 5, 0),
('Pick someone - arm wrestle. Loser chugs, winner takes a sip anyway.', false, 7, 0),
('Pick two people - all three of you drink together.', false, 5, 0),
('Pick a ''drinking buddy'' for the rest of the game - both drink now to seal it.', false, 5, 0),
('Pick someone - rock paper scissors. Loser drinks, then you drink too.', false, 4, 0),
('Pick someone you find attractive - cheers and drink together.', true, 7, 0),
('Pick someone you''d take home tonight - both drink.', true, 6, 1),
('Pick someone - whisper something dirty to them, then both drink.', true, 6, 0),
('Pick someone to give you a lap dance for 5 seconds. Both drink after.', true, 8, 1);
