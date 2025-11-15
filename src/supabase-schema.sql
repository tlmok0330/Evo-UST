-- =====================================================
-- CATHAY PACIFIC TRAVEL PLANNER - SUPABASE SCHEMA
-- =====================================================
-- This file contains the SQL schema for the database tables
-- Run these commands in your Supabase SQL Editor
-- =====================================================

-- Table: community_posts
-- Stores all community posts with their metadata
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  caption TEXT NOT NULL,
  image_url TEXT NOT NULL,
  eco_actions TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: post_keywords
-- Stores extracted keywords from each post (3 keywords per post)
CREATE TABLE IF NOT EXISTS post_keywords (
  id BIGSERIAL PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_post_keyword UNIQUE(post_id, keyword)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_post_keywords_keyword ON post_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_post_keywords_created_at ON post_keywords(created_at);
CREATE INDEX IF NOT EXISTS idx_post_keywords_post_id ON post_keywords(post_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_keywords ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow all users to read posts and keywords
CREATE POLICY "Allow public read access to community_posts"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to post_keywords"
  ON post_keywords FOR SELECT
  USING (true);

-- RLS Policies: Allow authenticated users to insert posts and keywords
CREATE POLICY "Allow authenticated insert to community_posts"
  ON community_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to post_keywords"
  ON post_keywords FOR INSERT
  WITH CHECK (true);

-- Create a function to get trending activities
CREATE OR REPLACE FUNCTION get_trending_activities(days_back INTEGER DEFAULT 30, result_limit INTEGER DEFAULT 10)
RETURNS TABLE (keyword TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pk.keyword,
    COUNT(*) as count
  FROM post_keywords pk
  WHERE pk.created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY pk.keyword
  ORDER BY count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE post_keywords_id_seq TO anon, authenticated;

-- Grant permissions on tables
GRANT SELECT, INSERT ON community_posts TO anon, authenticated;
GRANT SELECT, INSERT ON post_keywords TO anon, authenticated;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================
-- You can uncomment this to add sample data

/*
INSERT INTO community_posts (id, username, caption, image_url, eco_actions, likes, comments, created_at) VALUES
  ('sample-1', 'Tom', 'Amazing hiking trail in the mountains! #sustainable #nature', 'https://example.com/image1.jpg', ARRAY['Outdoor Activity', 'Eco-Certified Tour'], 15, 3, NOW() - INTERVAL '2 days'),
  ('sample-2', 'Sarah', 'Delicious plant-based meal at local restaurant', 'https://example.com/image2.jpg', ARRAY['Local Food', 'Reduced Food Waste'], 20, 5, NOW() - INTERVAL '1 day'),
  ('sample-3', 'John', 'Cycling through the city - zero emissions!', 'https://example.com/image3.jpg', ARRAY['Cycled or Walked', 'No Single-Use Plastics'], 18, 4, NOW());

INSERT INTO post_keywords (post_id, keyword, created_at) VALUES
  ('sample-1', 'hiking', NOW() - INTERVAL '2 days'),
  ('sample-1', 'mountain', NOW() - INTERVAL '2 days'),
  ('sample-1', 'nature', NOW() - INTERVAL '2 days'),
  ('sample-2', 'local food', NOW() - INTERVAL '1 day'),
  ('sample-2', 'plant-based', NOW() - INTERVAL '1 day'),
  ('sample-2', 'restaurant', NOW() - INTERVAL '1 day'),
  ('sample-3', 'cycling', NOW()),
  ('sample-3', 'city', NOW()),
  ('sample-3', 'eco friendly', NOW());
*/

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify your tables are set up correctly

-- Check if tables exist
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('community_posts', 'post_keywords');

-- Check trending activities
-- SELECT * FROM get_trending_activities(30, 10);

-- Count posts and keywords
-- SELECT 
--   (SELECT COUNT(*) FROM community_posts) as total_posts,
--   (SELECT COUNT(*) FROM post_keywords) as total_keywords;
