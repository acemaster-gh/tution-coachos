-- Create core tables for CoachOS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  google_id text UNIQUE,

  role text NOT NULL DEFAULT 'parent',

  is_email_verified boolean NOT NULL DEFAULT false,
  verification_token text,
  reset_token text,
  reset_token_expires timestamptz,

  student_id uuid,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE parents (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  email text
);

CREATE TABLE students (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  grade text NOT NULL,
  tutor_id uuid,
  parent_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE attendance (
  id uuid PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  present boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (student_id, date)
);

CREATE TABLE fees (
  id uuid PRIMARY KEY,
  student_id uuid REFERENCES students(id),
  amount numeric NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY,
  parent_name text NOT NULL,
  phone text NOT NULL,
  grade text NOT NULL,
  subject text NOT NULL,
  received_at timestamptz DEFAULT now(),
  converted boolean DEFAULT false
);

CREATE TABLE resources (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  grade text NOT NULL,
  type text NOT NULL,
  url text NOT NULL,
  uploaded_by uuid,
  uploaded_at timestamptz DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);