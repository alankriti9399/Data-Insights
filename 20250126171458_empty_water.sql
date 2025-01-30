/*
  # Create user datasets table

  1. New Tables
    - `user_datasets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `data` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_datasets` table
    - Add policies for authenticated users to manage their own datasets
*/

CREATE TABLE IF NOT EXISTS user_datasets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_datasets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own datasets"
  ON user_datasets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_datasets_user_id ON user_datasets(user_id);