-- Tipsy Trials - Supabase schema
--
-- Run this once in your Supabase project's SQL Editor (Project > SQL Editor > New query)
-- after creating the project. It creates all 11 tables the app already talks to via
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
('cheated on a test', false, 0, 0),
('pretended to know a song I''d never heard', false, 0, 0),
('fallen off a chair in public', false, 0, 0),
('texted my ex "accidentally on purpose"', false, 0, 0),
('gone through someone''s phone without asking', false, 0, 0),
('told a lie that spiraled out of control', false, 0, 0),
('shown up to the wrong event', false, 0, 0),
('peed in a pool', false, 0, 0),
('snooped through someone''s search history', false, 0, 0),
('gotten stuck in an elevator', false, 0, 0),
('lied about liking a gift', false, 0, 0),
('accidentally liked an old photo while stalking someone''s profile', false, 0, 0),
('cheated at a board game', false, 0, 0),
('sent a voice message and immediately regretted it', false, 0, 0),
('pretended to be someone else on a phone call', false, 0, 0),
('broken something valuable and blamed someone else', false, 0, 0),
('stayed friends with an ex', false, 0, 0),
('lied about my location to get out of plans', false, 0, 0),
('pretended to be busy just to avoid someone', false, 0, 0),
('gotten a bad haircut and pretended to love it', false, 0, 0),
('driven somewhere and forgotten why', false, 0, 0),
('faked an accent', false, 0, 0),
('snuck into a place I wasn''t supposed to be', false, 0, 0),
('accidentally sent a text to the person it was about', false, 0, 0),
('had a crush on a teacher or coach', true, 0, 0),
('almost sent a nude to the wrong person', true, 0, 0),
('regretted a hookup the next morning', true, 0, 0),
('lied to a partner about where I was', true, 0, 0),
('hooked up with someone on a first date', true, 0, 0),
('had a friends-with-benefits situation', true, 0, 0),
('been in a "situationship" I couldn''t explain to anyone', true, 0, 0),
('flirted with someone just to get something for free', true, 0, 0),
('had a wet dream about someone currently at this table', true, 0, 0),
('kissed someone whose name I didn''t actually know', true, 0, 0),
('sent a message meant for a group chat to the wrong person', false, 0, 0),
('pretended to understand a conversation I had no idea about', false, 0, 0),
('eaten something off someone''s plate without asking', false, 0, 0),
('fallen asleep during a movie at the theater', false, 0, 0),
('lied about my age to get a discount', false, 0, 0),
('forgotten someone''s name seconds after being introduced', false, 0, 0),
('worn mismatched shoes without realizing it', false, 0, 0),
('pretended to be sick to get out of something', false, 0, 0),
('gone to the wrong house thinking it was a friend''s', false, 0, 0),
('spilled a drink on someone at a party', false, 0, 0),
('forgotten I was on mute and said something I shouldn''t have', false, 0, 0),
('pretended not to see someone to avoid saying hi', false, 0, 0),
('lost a bet and had to do something embarrassing', false, 0, 0),
('forgotten my own phone number when asked', false, 0, 0),
('taken a nap that lasted way longer than planned', false, 0, 0),
('had a crush on someone at this table right now', true, 0, 0),
('lied about my body count', true, 0, 0),
('hooked up with a friend''s ex', true, 0, 0),
('sent a flirty text to the wrong person', true, 0, 0),
('had a one-night stand I never told anyone about', true, 0, 0),
('gotten caught checking someone out', true, 0, 0),
('had a much older or younger crush than I''d admit', true, 0, 0),
('kissed two different people in the same night', true, 0, 0),
('pretended to be single when I wasn''t', true, 0, 0),
('had a crush on someone I met online and never in person', true, 0, 0),
('gotten feelings for someone I said "it''s just casual" about', true, 0, 0),
('flirted with someone to make another person jealous', true, 0, 0),
('had a secret relationship no one knew about', true, 0, 0),
('hooked up with someone I met that same night at a party', true, 0, 0),
('thought about an ex while with someone else', true, 0, 0),
('showed up an hour early to something by mistake', false, 0, 0),
('forgotten to hit send on a message and found it days later', false, 0, 0),
('gotten scared by my own reflection', false, 0, 0),
('accidentally worn my shirt inside out all day', false, 0, 0),
('gotten a haircut right before a big event and regretted it', false, 0, 0),
('laughed at my own joke before finishing it', false, 0, 0),
('pretended to be on the phone to avoid a stranger', false, 0, 0),
('sent an email to the wrong recipient at work', false, 0, 0),
('gotten a song''s lyrics wrong for years without realizing it', false, 0, 0),
('said "love you" to someone I wasn''t supposed to, out of habit', false, 0, 0),
('accidentally posted something meant to stay a draft', false, 0, 0),
('had a crush that lasted way longer than it should have', true, 0, 0),
('hooked up with someone right after a breakup', true, 0, 0),
('had feelings for two people at the same time', true, 0, 0),
('stayed up all night texting someone new', true, 0, 0),
('had a workplace crush I never acted on', true, 0, 0),
('gone on a date I regretted within five minutes', true, 0, 0),
('had a friendship almost turn into something more', true, 0, 0),
('lied about how many people I''ve dated', true, 0, 0),
('had someone find out I liked them before I told them', true, 0, 0),
('felt jealous seeing an ex with someone new', true, 0, 0),
('had a crush confess to me and panicked', true, 0, 0),
('flirted back and forth for weeks without making a move', true, 0, 0),
('thought "this could be the one" way too early', true, 0, 0),
('cheated on a partner and never got caught', true, 0, 0),
('been cheated on and stayed anyway', true, 0, 0),
('wanted a threesome', true, 0, 0),
('slept with someone just to make an ex jealous', true, 0, 0),
('kept someone as a "backup option" while dating someone else', true, 0, 0),
('read a partner''s private messages without permission', true, 0, 0),
('ghosted someone right after sleeping with them', true, 0, 0),
('hooked up with someone way older or younger than me', true, 0, 0),
('had an unrequited crush on a close friend''s partner', true, 0, 0),
('kept messaging an ex behind my partner''s back', true, 0, 0),
('fantasized about someone else while with my partner', true, 0, 0),
('said "I love you" and didn''t fully mean it', true, 0, 0),
('had a pregnancy scare', true, 0, 0),
('been the "other person" in someone else''s relationship', true, 0, 0),
('deleted messages so a partner wouldn''t see them', true, 0, 0),
('used someone for their money or status', true, 0, 0),
('gotten drunk and revealed a secret I really shouldn''t have', true, 0, 0),
('lied to my family about who I was dating', true, 0, 0),
('kept an entire relationship secret from my parents', true, 0, 0),
('hooked up with someone I met on a work or school trip', true, 0, 0),
('stayed friends with someone specifically hoping for more', true, 0, 0),
('lied about being exclusive with someone', true, 0, 0),
('had someone else''s name almost slip out at the wrong moment', true, 0, 0),
('hooked up with two people who know each other', true, 0, 0),
('been in love with someone who was already taken', true, 0, 0),
('told a friend''s secret to someone else', true, 0, 0),
('dated someone just to get back at an ex', true, 0, 0),
('lied about my income to impress someone', true, 0, 0),
('borrowed money and never paid it back', true, 0, 0),
('talked badly about a friend to someone they were dating', true, 0, 0),
('hooked up with someone my friend had feelings for', true, 0, 0),
('pretended not to remember a hookup out of pure embarrassment', true, 0, 0),
('sabotaged someone else''s relationship on purpose', true, 0, 0),
('lied to a partner about my past', true, 0, 0),
('used a fake name on a date', true, 0, 0),
('stayed in a relationship only because I was scared to be alone', true, 0, 0),
('told someone I loved them just to keep them around', true, 0, 0),
('cried to get out of trouble', true, 0, 0),
('lied about where money went in a relationship', true, 0, 0),
('snooped through a partner''s phone and found something I regret seeing', true, 0, 0),
('found out I was someone''s "backup" and stayed anyway', true, 0, 0),
('lied about liking someone''s family just to keep the peace', true, 0, 0),
('pretended to have moved on from an ex when I really hadn''t', true, 0, 0),
('compared a current partner to an ex out loud', true, 0, 0),
('hooked up with someone and pretended I didn''t remember their name', true, 0, 0),
('broken up with someone over text', true, 0, 0),
('been jealous of a friend''s relationship', true, 0, 0),
('wished something bad on an ex''s new partner', true, 0, 0),
('stayed friends with someone I secretly couldn''t stand', true, 0, 0),
('lied to a cop to get out of a ticket', false, 0, 0),
('left a fake review out of spite', false, 0, 0),
('rage quit a video game', false, 0, 0),
('talked to my pet like it could understand everything', false, 0, 0),
('eaten a mystery leftover I couldn''t identify', false, 0, 0),
('fallen asleep at work or in class', false, 0, 0),
('pretended to work out harder than I actually did', false, 0, 0),
('lied about my fitness routine', false, 0, 0),
('forgotten I had plans and double-booked myself', false, 0, 0),
('shown up to the gym and immediately left', false, 0, 0),
('sent a text while half asleep that made no sense', false, 0, 0),
('gotten scammed online', false, 0, 0),
('pretended to understand a menu in another language', false, 0, 0),
('talked my way out of a parking ticket', false, 0, 0),
('gotten way too competitive over a board game', false, 0, 0),
('said something awkward just to fill silence', false, 0, 0),
('laughed at a stranger''s expense and felt bad after', false, 0, 0),
('pretended to be someone''s biggest fan to fit in', false, 0, 0),
('gotten caught talking about someone right as they walked in', false, 0, 0),
('binged an entire show in one sitting and regretted it', false, 0, 0),
('sent a message to an ex that I immediately regretted', true, 0, 0),
('stalked someone''s new partner online', true, 0, 0),
('compared myself to someone''s ex', true, 0, 0),
('gotten nervous just from a crush texting first', true, 0, 0),
('had a "type" my friends warned me about', true, 0, 0),
('kept talking to someone even after being told to stop', true, 0, 0),
('had a friend warn me a crush was bad news and ignored it', true, 0, 0),
('had feelings I never admitted to a close friend', true, 0, 0),
('stayed talking to someone I knew wasn''t good for me', true, 0, 0),
('gotten way too invested in someone I barely knew', true, 0, 0),
('had an ex try to win me back and considered it', true, 0, 0),
('lied about how a relationship actually ended', true, 0, 0),
('kept a photo of an ex longer than I should have', true, 0, 0),
('still checked an ex''s social media regularly', true, 0, 0),
('had someone I was into choose my friend instead', true, 0, 0),
('had a threesome', true, 0, 0),
('had sex in a public place', true, 0, 0),
('had a one-night stand with a total stranger', true, 0, 0),
('sent a nude', true, 0, 0),
('had sex on the first date', true, 0, 0),
('had sex with someone whose name I never actually learned', true, 0, 0),
('used a sex toy', true, 0, 0),
('hooked up in a bathroom at a party or bar', true, 0, 0),
('had sex in a car', true, 0, 0),
('faked finishing', true, 0, 0),
('had a hookup while on vacation I never mentioned again', true, 0, 0),
('had sex with someone I met less than 24 hours before', true, 0, 0),
('hooked up with a coworker', true, 0, 0),
('had a hookup end so awkwardly I left without saying goodbye', true, 0, 0),
('tried role-play with a partner', true, 0, 0),
('had an open relationship or "hall pass" arrangement', true, 0, 0),
('done something in bed I''ve never told anyone about', true, 0, 0),
('had a dare go further than expected', true, 0, 0),
('snuck someone out of the house', true, 0, 0),
('had morning-after regret so bad I left before they woke up', true, 0, 0),
('hooked up with someone at a wedding', true, 0, 0),
('had a quickie somewhere I really shouldn''t have', true, 0, 0),
('had a hookup I''d never admit to at this table', true, 0, 0),
('lied about my "number" to seem less experienced', true, 0, 0),
('pretended an ex didn''t exist when talking to someone new', true, 0, 0),
('had a friend''s ex hit on me', true, 0, 0),
('gotten caught by a roommate mid-hookup', true, 0, 0),
('had a hookup buddy for over a year', true, 0, 0),
('slid back into an ex''s DMs after months of no contact', true, 0, 0),
('had a one-night stand turn into something longer', true, 0, 0),
('lied about liking something in bed to avoid an awkward talk', true, 0, 0),
('hooked up with someone purely out of boredom', true, 0, 0),
('used alcohol as an excuse for a hookup I actually wanted', true, 0, 0),
('said "we''re just having fun" when it clearly wasn''t just fun for me', true, 0, 0),
('texted an ex while in a new relationship', true, 0, 0),
('had an ex''s friend message me', true, 0, 0),
('pretended to be more experienced than I actually am', true, 0, 0),
('had someone find messages on my phone I didn''t want them to see', true, 0, 0),
('sent something risky to the wrong group chat', true, 0, 0),
('had a hookup I only remember parts of', true, 0, 0),
('had to ask for someone''s name again the next morning', true, 0, 0),
('been accused of cheating when I actually was', true, 0, 0),
('lied about being ready for a relationship just to keep someone around', true, 0, 0),
('lied on my resume or CV', false, 0, 0),
('googled my symptoms and convinced myself I was dying', false, 0, 0),
('pretended to be happy for someone when I really wasn''t', false, 0, 0),
('avoided answering a call because I didn''t want to deal with it', false, 0, 0),
('lied to a friend about why I couldn''t make it to something', false, 0, 0),
('pretended not to care about something that really hurt', false, 0, 0),
('lied to get out of paying for something', false, 0, 0),
('taken credit for someone else''s idea', false, 0, 0),
('avoided a friend for weeks without telling them why', false, 0, 0),
('pretended to laugh at a joke I didn''t actually understand', false, 0, 0),
('said something petty just to win an argument', false, 0, 0),
('lied about being busy to skip a family event', false, 0, 0),
('judged someone based on their appearance and regretted it', false, 0, 0),
('talked myself out of an opportunity out of fear', false, 0, 0),
('pretended not to notice someone was upset with me', false, 0, 0),
('gone into debt for something I didn''t need', false, 0, 0),
('hidden a purchase from a partner or family member', false, 0, 0),
('lied about how much something cost', false, 0, 0),
('let someone take the blame for something I did', false, 0, 0),
('avoided a family member on purpose for months', false, 0, 0),
('lied about how I really feel just to keep the peace', false, 0, 0),
('lied about myself on a dating app', false, 0, 0),
('taken a solo trip', false, 0, 0),
('changed someone''s mind about something important', false, 0, 0),
('sent an anonymous gift', false, 0, 0),
('spied on my neighbors', false, 0, 0),
('stolen something small from a restaurant', false, 0, 0),
('made up a story about myself to impress someone', false, 0, 0),
('had a wardrobe malfunction in public', false, 0, 0),
('snuck into a movie or concert without paying', false, 0, 0),
('lied about my job to sound cooler', false, 0, 0),
('sent a text to the wrong person on purpose', false, 0, 0),
('kissed a stranger', false, 0, 0),
('ghosted someone I was dating', false, 0, 0),
('fallen in love at first sight', false, 0, 0),
('flirted with a bartender or barista', false, 0, 0),
('climbed a mountain', false, 0, 0),
('ridden a camel', false, 0, 0),
('been in a cave', false, 0, 0),
('been to a major festival like Coachella', false, 0, 0),
('lost a personal item in another country', false, 0, 0),
('been to a major sports final', false, 0, 0),
('laughed so hard I spit out my drink', false, 0, 0),
('tried to impress someone and failed miserably', false, 0, 0),
('had a funny misunderstanding', false, 0, 0),
('tried to sound smart and made a fool of myself', false, 0, 0),
('accidentally waved at a stranger thinking I knew them', false, 0, 0),
('learned a language to better communicate with someone', false, 0, 0),
('dined and dashed', false, 0, 0),
('lied to someone playing this game right now', false, 0, 0),
('drunk texted an ex', false, 0, 0),
('started a rumor', false, 0, 0),
('convinced a friend to dump their partner', false, 0, 0),
('fought with someone in public', false, 0, 0),
('gotten into a car crash', false, 0, 0),
('tried psychedelics', true, 0, 0),
('had a video go viral', false, 0, 0),
('regifted something', false, 0, 0),
('met a celebrity', false, 0, 0),
('done a prank call', false, 0, 0),
('participated in a protest', false, 0, 0),
('peed my pants as an adult', false, 0, 0),
('been to a strip club', true, 0, 0),
('been on a blind date', false, 0, 0),
('had a paranormal experience', false, 0, 0),
('been to a fortune teller', false, 0, 0),
('been hypnotized', false, 0, 0),
('collected stamps, coins, or trading cards', false, 0, 0);

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
('Name 10 countries in Europe.', 10, false, 0, 0),
('Name 10 pizza toppings.', 10, false, 0, 0),
('Name 10 breakfast foods.', 10, false, 0, 0),
('Name 7 classic sitcoms.', 7, false, 0, 0),
('Name 8 Marvel movies.', 8, false, 0, 0),
('Name 7 NBA teams.', 7, false, 0, 0),
('Name 10 ice cream flavors.', 10, false, 0, 0),
('Name 10 things you''d find in a bathroom.', 10, false, 0, 0),
('Name 5 boy bands or girl groups.', 5, false, 0, 0),
('Name 9 video games.', 9, false, 0, 0),
('Name 5 countries in Africa.', 5, false, 0, 0),
('Name 7 types of pasta.', 7, false, 0, 0),
('Name 6 James Bond movies.', 6, false, 0, 0),
('Name 6 famous talk show hosts.', 6, false, 0, 0),
('Name 8 rappers.', 8, false, 0, 0),
('Name 7 romantic comedy movies.', 7, false, 0, 0),
('Name 9 things you''d pack for a road trip.', 9, false, 0, 0),
('Name 9 US states.', 9, false, 0, 0),
('Name 5 fictional wizards or witches.', 5, false, 0, 0),
('Name 6 reality TV shows.', 6, false, 0, 0),
('Name 10 things that are red.', 10, false, 0, 0),
('Name 8 excuses for being late.', 8, false, 0, 0),
('Name 9 chocolate or candy bars.', 9, false, 0, 0),
('Name 9 things you''d find in a gym bag.', 9, false, 0, 0),
('Name 8 types of sandwiches.', 8, false, 0, 0),
('Name 7 Pixar movies.', 7, false, 0, 0),
('Name 5 things that are illegal almost everywhere.', 5, false, 0, 0),
('Name 9 animals you''d see at a zoo.', 9, false, 0, 0),
('Name 8 dog breeds.', 8, false, 0, 0),
('Name 5 famous painters.', 5, false, 0, 0),
('Name 9 things you do before bed.', 9, false, 0, 0),
('Name 10 apps on your phone.', 10, false, 0, 0),
('Name 8 sodas or soft drinks.', 8, false, 0, 0),
('Name 8 things you''d bring to a deserted island.', 8, false, 0, 0),
('Name 9 things found at a wedding.', 9, false, 0, 0),
('Name 7 things that ruin a first date.', 7, false, 0, 0),
('Name 5 famous stand-up comedians.', 5, false, 0, 0),
('Name 6 90s cartoons.', 6, false, 0, 0),
('Name 5 fictional detectives.', 5, false, 0, 0),
('Name 9 things you''d find at the beach.', 9, false, 0, 0),
('Name 6 TV shows set in New York.', 6, false, 0, 0),
('Name 6 iconic movie couples.', 6, false, 0, 0),
('Name 10 things that are yellow.', 10, false, 0, 0),
('Name 8 types of nuts.', 8, false, 0, 0),
('Name 5 famous magicians.', 5, false, 0, 0),
('Name 8 excuses to leave a boring party.', 8, false, 0, 0),
('Name 5 famous DJs.', 5, false, 0, 0),
('Name 8 things people collect as a hobby.', 8, false, 0, 0),
('Name 9 things you''d find in an office.', 9, false, 0, 0),
('Name 6 famous rivers.', 6, false, 0, 0),
('Name 10 things that are round.', 10, false, 0, 0),
('Name 8 famous soccer players.', 8, false, 0, 0),
('Name 6 kinds of tea.', 6, false, 0, 0),
('Name 9 breakfast cereals.', 9, false, 0, 0),
('Name 5 famous mountains.', 5, false, 0, 0),
('Name 9 things in a school classroom.', 9, false, 0, 0),
('Name 9 things you''d find in a hotel room.', 9, false, 0, 0),
('Name 8 excuses for missing work.', 8, false, 0, 0),
('Name 6 famous chefs.', 6, false, 0, 0),
('Name 9 things that fly.', 9, false, 0, 0),
('Name 6 things you shouldn''t microwave.', 6, false, 0, 0),
('Name 7 amusement park rides.', 7, false, 0, 0),
('Name 8 things you''d find in grandma''s house.', 8, false, 0, 0),
('Name 9 things that are sticky.', 9, false, 0, 0),
('Name 8 places you shouldn''t have sex.', 8, true, 0, 0),
('Name 8 red flags in a relationship.', 8, true, 0, 0),
('Name 8 things people lie about on dating apps.', 8, true, 0, 0),
('Name 8 signs someone is flirting with you.', 8, true, 0, 0),
('Name 6 excuses for a bad hookup.', 6, true, 0, 0),
('Name 5 slang words for kissing.', 5, true, 0, 0),
('Name 8 things people do drunk that they regret.', 8, true, 0, 0),
('Name 8 cheesy pickup lines.', 8, true, 0, 0),
('Name 8 things you should never text an ex.', 8, true, 0, 0),
('Name 8 things you might find in a stranger''s bedroom.', 8, true, 0, 0),
('Name 7 hangover cures.', 7, true, 0, 0),
('Name 8 excuses for being single.', 8, true, 0, 0),
('Name 6 things people do to make an ex jealous.', 6, true, 0, 0),
('Name 8 instant turn-offs.', 8, true, 0, 0),
('Name 8 things you shouldn''t do at an office party.', 8, true, 0, 0);

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
-- Question suggestions (user-submitted question/dare/category ideas) - no seed data, starts empty
-- ============================================================================
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
    'stat_top_drinker', 'stat_top_answerer', 'stat_heavy_drinker', 'stat_heavy_answerer',
    'dry_streak'
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
('stat_heavy_answerer', '{name} is barely drinking tonight.'),

('dry_streak', '{name}, you haven''t taken a sip in a while - take one now.'),
('dry_streak', '{name} has answered {count} in a row without drinking. Fix that.'),
('dry_streak', 'Suspiciously sober, {name}. Take a sip before this round starts.'),
('dry_streak', '{name}''s answer streak is impressive - but it''s time for a sip.');

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

-- ============================================================================
-- Wingman prompts
-- ============================================================================
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

-- ============================================================================
-- Bonding questions
-- ============================================================================
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
-- Truth or Dare: Round 1 new truths (46 clean + 25 spicy), picked via checkbox shortlist artifact
insert into truth_dare_prompts (type, text, dirty, like_count, dislike_count) values
('truth', 'What''s a habit you have that you''d never admit to a stranger?', false, 0, 0),
('truth', 'What''s the most embarrassing thing that''s happened to you at school or work?', false, 0, 0),
('truth', 'Who''s the last person you stalked on social media?', false, 0, 0),
('truth', 'What''s a secret talent nobody in this room knows about?', false, 0, 0),
('truth', 'What''s the dumbest thing you''ve ever cried about?', false, 0, 0),
('truth', 'What''s the most trouble you''ve ever gotten into?', false, 0, 0),
('truth', 'What''s a text you sent to the wrong person?', false, 0, 0),
('truth', 'What''s the weirdest dream you''ve had about someone in this room?', false, 0, 0),
('truth', 'What''s a food combo you love that everyone judges you for?', false, 0, 0),
('truth', 'What''s the most awkward thing you''ve said on a first date?', false, 0, 0),
('truth', 'Who do you think is most likely to become famous in this room?', false, 0, 0),
('truth', 'What''s a childhood nickname you''re embarrassed by?', false, 0, 0),
('truth', 'What''s the last thing you lied to your parents about?', false, 0, 0),
('truth', 'What''s the pettiest thing you''ve ever done for revenge?', false, 0, 0),
('truth', 'What''s a rule you always break?', false, 0, 0),
('truth', 'What''s the most useless talent you have?', false, 0, 0),
('truth', 'What''s a purchase you regret the most?', false, 0, 0),
('truth', 'What''s the most embarrassing song on your playlist?', false, 0, 0),
('truth', 'What''s the weirdest thing you''ve done to impress someone?', false, 0, 0),
('truth', 'What''s a secret you kept from your best friend?', false, 0, 0),
('truth', 'What''s the most childish thing you still do?', false, 0, 0),
('truth', 'What''s a white lie you tell often?', false, 0, 0),
('truth', 'What''s the most embarrassing thing your parents have caught you doing?', false, 0, 0),
('truth', 'Who''s the messiest person in this room?', false, 0, 0),
('truth', 'What''s the most cringeworthy thing you''ve posted online?', false, 0, 0),
('truth', 'What''s your biggest ick?', false, 0, 0),
('truth', 'What''s a job you''d be terrible at?', false, 0, 0),
('truth', 'What''s your most controversial food opinion?', false, 0, 0),
('truth', 'What''s something you pretend to understand but don''t?', false, 0, 0),
('truth', 'What''s the most embarrassing thing you''ve done in front of a crush?', false, 0, 0),
('truth', 'Who in this room do you think has the most secrets?', false, 0, 0),
('truth', 'What''s a promise you never kept?', false, 0, 0),
('truth', 'What''s the worst advice you''ve ever given?', false, 0, 0),
('truth', 'What''s the most awkward silence you''ve ever caused?', false, 0, 0),
('truth', 'What''s your go-to excuse to leave somewhere early?', false, 0, 0),
('truth', 'What''s the most embarrassing outfit you''ve ever worn in public?', false, 0, 0),
('truth', 'What''s a grudge you''re still holding onto?', false, 0, 0),
('truth', 'What''s the last thing you apologized for but didn''t mean it?', false, 0, 0),
('truth', 'What''s the weirdest compliment you''ve ever received?', false, 0, 0),
('truth', 'What''s the most embarrassing thing that''s happened to you on a night out?', false, 0, 0),
('truth', 'What''s a household chore you always avoid?', false, 0, 0),
('truth', 'What''s the worst excuse you''ve ever used to get out of plans?', false, 0, 0),
('truth', 'What''s the most embarrassing thing you''ve done for attention?', false, 0, 0),
('truth', 'What''s a conspiracy theory you secretly believe?', false, 0, 0),
('truth', 'Who in this room texts you the most, and what''s it usually about?', false, 0, 0),
('truth', 'What''s a talent show act you''d actually perform right now if you had to?', false, 0, 0),
('truth', 'What''s the most attractive quality you look for in someone?', true, 0, 0),
('truth', 'Have you ever had a crush on someone else''s partner?', true, 0, 0),
('truth', 'What''s the boldest move you''ve ever made on someone?', true, 0, 0),
('truth', 'Who in this room would you swipe right on?', true, 0, 0),
('truth', 'What''s the most scandalous thing you''ve done at a party?', true, 0, 0),
('truth', 'Have you ever hooked up with someone you regret?', true, 0, 0),
('truth', 'What''s your biggest turn-off?', true, 0, 0),
('truth', 'What''s the wildest place you''ve hooked up?', true, 0, 0),
('truth', 'Who''s the best kisser you''ve ever kissed?', true, 0, 0),
('truth', 'What''s a fantasy you''ve never told anyone?', true, 0, 0),
('truth', 'Have you ever sent a risky text to the wrong person?', true, 0, 0),
('truth', 'What''s the most attractive thing someone can wear?', true, 0, 0),
('truth', 'What''s the longest you''ve gone without a relationship, and why?', true, 0, 0),
('truth', 'Have you ever cheated or been tempted to?', true, 0, 0),
('truth', 'What''s your biggest turn-on?', true, 0, 0),
('truth', 'What''s the most embarrassing thing that''s happened to you in bed?', true, 0, 0),
('truth', 'Who''s someone in this room you''d date if you were single?', true, 0, 0),
('truth', 'Have you ever had a crush on a friend''s ex?', true, 0, 0),
('truth', 'What''s the most inappropriate place you''ve thought about hooking up?', true, 0, 0),
('truth', 'Have you ever faked being into someone just to see where it went?', true, 0, 0),
('truth', 'What''s the cheesiest pickup line that''s actually worked on you?', true, 0, 0),
('truth', 'Who was your most awkward "it''s complicated" situation?', true, 0, 0),
('truth', 'What''s the drunkest you''ve ever been around your crush?', true, 0, 0),
('truth', 'Have you ever been caught checking someone out?', true, 0, 0),
('truth', 'What''s a red flag you ignored because someone was hot?', true, 0, 0);

