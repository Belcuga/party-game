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
