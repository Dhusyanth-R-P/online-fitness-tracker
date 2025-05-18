/*
  # Initial Schema Setup for Online Voting System

  1. New Tables
    - Users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
    - Polls
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - created_by (uuid, references Users)
      - created_at (timestamp)
    - Options
      - id (uuid, primary key)
      - poll_id (uuid, references Polls)
      - option_text (text)
    - Votes
      - id (uuid, primary key)
      - poll_id (uuid, references Polls)
      - option_id (uuid, references Options)
      - user_id (uuid, references Users)
      - voted_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Options table
CREATE TABLE IF NOT EXISTS options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) NOT NULL,
  option_text text NOT NULL
);

-- Create Votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) NOT NULL,
  option_id uuid REFERENCES options(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  voted_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can read polls" ON polls
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create polls" ON polls
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can read options" ON options
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can create options for their polls" ON options
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = options.poll_id
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can vote once per poll" ON votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM votes
      WHERE votes.poll_id = votes.poll_id
      AND votes.user_id = auth.uid()
    )
  );