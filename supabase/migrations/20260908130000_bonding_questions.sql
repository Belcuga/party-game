-- Bonding questions
create table if not exists bonding_questions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  text text not null,
  dirty boolean not null default false,
  like_count integer not null default 0,
  dislike_count integer not null default 0
);

alter table bonding_questions enable row level security;
create policy "Public read" on bonding_questions for select using (true);
create policy "Public insert" on bonding_questions for insert with check (true);
create policy "Public update" on bonding_questions for update using (true) with check (true);
create policy "Public delete" on bonding_questions for delete using (true);

insert into bonding_questions (text, dirty, like_count, dislike_count) values
('{player}, what''s the happiest memory from your childhood?', false, 5, 0),
('{player}, what''s something you''re really proud of but rarely talk about?', false, 5, 0),
('{player}, what are you most afraid of?', false, 4, 0),
('{player}, what''s a moment that changed how you see life?', false, 5, 0),
('{player}, who has influenced you the most, and how?', false, 4, 0),
('{player}, what''s something you wish people understood about you?', false, 5, 0),
('{player}, what''s a fear you''ve overcome that you''re proud of?', false, 4, 0),
('{player}, what does true friendship mean to you?', false, 3, 0),
('{player}, what''s the kindest thing anyone has ever done for you?', false, 4, 0),
('{player}, what''s something you''ve never told anyone at this table?', false, 6, 0),
('{player}, what''s a regret you''ve made peace with?', false, 4, 0),
('{player}, when do you feel most like yourself?', false, 3, 0),
('{player}, what''s the best piece of advice you''ve ever received?', false, 3, 0),
('{player}, what''s something you''re still figuring out about yourself?', false, 4, 0),
('{player}, what do you value most in the people you keep close?', false, 3, 0),
('{player}, what''s a relationship (any kind) that shaped who you are today?', true, 5, 0),
('{player}, what''s the most vulnerable you''ve ever let yourself be with someone?', true, 5, 0),
('{player}, what was your first impression when you met {other}?', false, 6, 0),
('{player}, what''s one thing you admire about {other}?', false, 5, 0),
('{player}, describe {other} in three words.', false, 4, 0),
('{player}, what do you think {other} is secretly really good at?', false, 4, 0),
('{player}, what''s a memory you have with {other} that you still think about?', false, 5, 0),
('{player}, if {other} was a movie character, who would they be and why?', false, 4, 0),
('{player}, what do you think {other} needs to hear more often?', false, 5, 0);
