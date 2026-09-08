-- Question suggestions (user-submitted question/dare/category ideas) - no seed data, starts empty
create table if not exists question_suggestions (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  message text not null,
  email text,
  read boolean not null default false
);

alter table question_suggestions enable row level security;
create policy "Public read" on question_suggestions for select using (true);
create policy "Public insert" on question_suggestions for insert with check (true);
create policy "Public update" on question_suggestions for update using (true) with check (true);
create policy "Public delete" on question_suggestions for delete using (true);
