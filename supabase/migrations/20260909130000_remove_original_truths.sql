-- Truth or Dare: remove the original 10 placeholder truths now that Round 1's
-- 71 real truths are live. Dares (also from the original seed) are untouched.
delete from truth_dare_prompts
where type = 'truth'
  and text in (
    'What''s the most embarrassing thing in your search history?',
    'What''s a lie you told that almost got you caught?',
    'Who in this room would you trust with a secret?',
    'What''s your most irrational fear?',
    'What''s the pettiest reason you''ve ever been mad at someone?',
    'What''s a rumor you''ve heard about yourself?',
    'What''s the worst gift you''ve ever received?',
    'Who was your worst kiss?',
    'What''s the most attractive thing about the person to your right?',
    'Have you ever had a crush on someone in this room?'
  );
