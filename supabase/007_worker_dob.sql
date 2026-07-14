-- 007: Add date of birth to workers (age is computed in the app, not stored,
-- so it always stays accurate without needing manual updates).

alter table public.workers add column if not exists date_of_birth date;
