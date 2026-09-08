-- Wingman prompts
create table if not exists wingman_prompts (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  text text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table wingman_prompts enable row level security;
create policy "Public read" on wingman_prompts for select using (true);
create policy "Public insert" on wingman_prompts for insert with check (true);
create policy "Public update" on wingman_prompts for update using (true) with check (true);
create policy "Public delete" on wingman_prompts for delete using (true);

insert into wingman_prompts (text, dirty, like_count, dislike_count) values
('{player}, pick two other players - they have to compliment each other''s eyes, no laughing.', false, 4, 0),
('{player}, pick two other players - they have to slow dance together for 10 seconds.', false, 5, 0),
('{player}, play matchmaker - pick two people who have to hold hands until your next turn.', false, 4, 0),
('{player}, pick two other players - they have to whisper something nice to each other.', false, 3, 0),
('{player}, pick two other players - they have to feed each other a sip of their drink.', false, 5, 0),
('{player}, pick two other players - they have to guess something they''d have in common.', false, 3, 0),
('{player}, pick two other players - they have to make out for 5 seconds.', true, 7, 1),
('{player}, pick two other players - they have to sit on each other''s lap for the next round.', true, 6, 0),
('{player} is paired with {other} - hold eye contact for 10 seconds, no laughing.', false, 5, 0),
('{player} is paired with {other} - give each other your best pickup line.', false, 5, 0),
('{player} is paired with {other} - {player} has to guess three things about {other}.', false, 4, 0),
('{player} is paired with {other} - dance together for 10 seconds.', false, 4, 0),
('{player} is paired with {other} - link arms and take your next sip together.', false, 4, 0),
('{player} is paired with {other} - give them a genuine compliment.', false, 3, 0),
('{player} is paired with {other} - kiss on the cheek.', true, 6, 1),
('{player} is paired with {other} - whisper something flirty to them.', true, 7, 0),
('{player}, pick someone - give them a genuine compliment.', false, 4, 0),
('{player}, pick someone - stare into their eyes for 10 seconds, no laughing.', false, 4, 0),
('{player}, pick someone - let them pick your next drink.', false, 3, 0),
('{player}, pick someone - hold their hand until your next turn.', false, 4, 0),
('{player}, pick someone - tell them your first impression of them.', false, 3, 0),
('{player}, pick someone you find attractive here and tell them why.', true, 7, 0),
('{player}, pick someone - kiss them on the cheek.', true, 6, 1),
('{player}, pick someone - whisper your best pickup line to them.', true, 7, 0);
