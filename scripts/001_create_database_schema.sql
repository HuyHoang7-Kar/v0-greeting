-- Enable extensions (nếu chưa có)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================
-- USERS TABLE (linked to Supabase Auth)
-- =========================
drop table if exists public.users cascade;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role text default 'student',
  created_at timestamp with time zone default now()
);

-- =========================
-- FLASHCARDS
-- =========================
drop table if exists public.flashcards cascade;

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  front text not null,
  back text not null,
  subject text,
  created_at timestamp with time zone default now()
);

-- =========================
-- QUIZZES
-- =========================
drop table if exists public.quizzes cascade;

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  subject text,
  created_at timestamp with time zone default now()
);

drop table if exists public.quiz_questions cascade;

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer text not null
);

-- =========================
-- GAMES
-- =========================
drop table if exists public.games cascade;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text,
  created_at timestamp with time zone default now()
);

drop table if exists public.user_game_progress cascade;

create table if not exists public.user_game_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  score integer default 0,
  completed boolean default false,
  created_at timestamp with time zone default now()
);

-- =========================
-- REWARDS & LEADERBOARD
-- =========================
drop table if exists public.achievements cascade;

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);

drop table if exists public.leaderboard cascade;

create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  points integer default 0,
  rank integer,
  updated_at timestamp with time zone default now()
);

-- =========================
-- NOTES (student notes)
-- =========================
drop table if exists public.notes cascade;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);
