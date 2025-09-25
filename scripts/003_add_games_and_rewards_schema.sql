-- Add games table for different game types
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('memory_match', 'word_scramble', 'speed_quiz', 'drag_drop')),
  category TEXT NOT NULL CHECK (category IN ('math', 'english', 'literature')),
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on games
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "games_select_all" ON public.games FOR SELECT TO authenticated;
CREATE POLICY "games_insert_teachers" ON public.games FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "games_update_own" ON public.games FOR UPDATE 
  USING (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "games_delete_own" ON public.games FOR DELETE 
  USING (
    auth.uid() = created_by AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );

-- Add game_questions table for game content
CREATE TABLE IF NOT EXISTS public.game_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  options JSONB, -- For multiple choice options
  hints TEXT,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on game_questions
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;

-- Game questions policies
CREATE POLICY "game_questions_select_all" ON public.game_questions FOR SELECT TO authenticated;
CREATE POLICY "game_questions_insert_teachers" ON public.game_questions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.games g 
      JOIN public.profiles p ON g.created_by = p.id 
      WHERE g.id = game_id AND p.id = auth.uid() AND p.role = 'teacher'
    )
  );
CREATE POLICY "game_questions_update_teachers" ON public.game_questions FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.games g 
      JOIN public.profiles p ON g.created_by = p.id 
      WHERE g.id = game_id AND p.id = auth.uid() AND p.role = 'teacher'
    )
  );
CREATE POLICY "game_questions_delete_teachers" ON public.game_questions FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.games g 
      JOIN public.profiles p ON g.created_by = p.id 
      WHERE g.id = game_id AND p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- Add user_points table for tracking points and achievements
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  streak_days INTEGER DEFAULT 0,
  last_activity DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_points
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- User points policies
CREATE POLICY "user_points_select_own" ON public.user_points FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "user_points_insert_own" ON public.user_points FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_points_update_own" ON public.user_points FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add game_results table for tracking game performance
CREATE TABLE IF NOT EXISTS public.game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  points_earned INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on game_results
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;

-- Game results policies
CREATE POLICY "game_results_select_own" ON public.game_results FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
  );
CREATE POLICY "game_results_insert_own" ON public.game_results FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add leaderboard view
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
  p.id,
  p.full_name,
  p.email,
  COALESCE(up.points, 0) as total_points,
  COALESCE(up.level, 1) as level,
  COALESCE(up.streak_days, 0) as streak_days,
  COALESCE(up.badges, '[]'::jsonb) as badges,
  ROW_NUMBER() OVER (ORDER BY COALESCE(up.points, 0) DESC) as rank
FROM public.profiles p
LEFT JOIN public.user_points up ON p.id = up.user_id
WHERE p.role = 'student'
ORDER BY total_points DESC;

-- Add function to automatically create user_points record
CREATE OR REPLACE FUNCTION public.handle_new_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_points (user_id, points, level, experience)
  VALUES (NEW.id, 0, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create user_points on profile creation
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_points();

-- Add updated_at triggers for new tables
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON public.user_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add function to update user points and level
CREATE OR REPLACE FUNCTION public.update_user_points(
  p_user_id UUID,
  p_points_earned INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_points INTEGER;
  current_level INTEGER;
  new_level INTEGER;
BEGIN
  -- Get current points and level
  SELECT points, level INTO current_points, current_level
  FROM public.user_points
  WHERE user_id = p_user_id;
  
  -- Calculate new level (every 100 points = 1 level)
  new_level := GREATEST(1, (current_points + p_points_earned) / 100 + 1);
  
  -- Update points and level
  UPDATE public.user_points
  SET 
    points = points + p_points_earned,
    level = new_level,
    experience = experience + p_points_earned,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Award level up badge if leveled up
  IF new_level > current_level THEN
    UPDATE public.user_points
    SET badges = badges || jsonb_build_array(
      jsonb_build_object(
        'type', 'level_up',
        'level', new_level,
        'earned_at', NOW()
      )
    )
    WHERE user_id = p_user_id;
  END IF;
END;
$$;
