-- ==================================================
-- RecipeHub Database Schema
-- Foundational Phase Tables: recipes, steps
-- Uses Supabase Auth for user management (auth.users)
-- ==================================================

-- Recipes Table
-- Recipe Metadata & Link to Author (via Supabase Auth)
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE
);

-- Steps Table
-- Stores step-by-step cooking instructions
CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    UNIQUE(recipe_id, step_order)
);

-- Recipe Details Table
-- Stores checklist-friendly ingredients and steps for each recipe
CREATE TABLE recipe_details (
    recipe_id INTEGER PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
    steps TEXT[] DEFAULT ARRAY[]::TEXT[],
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Favorites Table
-- Tracks which users have favorited which recipes (community + external)
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    source VARCHAR(50) DEFAULT 'community',
    external_id INTEGER,
    title VARCHAR(255),
    image_url VARCHAR(500),
    source_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id),
    UNIQUE (user_id, source, external_id)
);

-- Ratings Table
-- Stores user ratings (1-5) for community and external recipes
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    source VARCHAR(50) DEFAULT 'community',
    external_id INTEGER,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id),
    UNIQUE (user_id, source, external_id)
);

-- Comments Table
-- Stores user comments on recipes
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- Indexes for common queries
-- ==================================================

-- Fast Lookup of Recipes by author
CREATE INDEX idx_recipes_user_id ON recipes(user_id);

-- Fast lookup of steps by recipe
CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);

-- Fast lookup of checklist details by recipe
CREATE INDEX idx_recipe_details_recipe_id ON recipe_details(recipe_id);

-- Search recipes by title (case-insensitive)
CREATE INDEX idx_recipes_title ON recipes(LOWER(title));

-- Fast lookup of favorites by user
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- Fast lookup of ratings by user
CREATE INDEX idx_ratings_user_id ON ratings(user_id);

-- Fast lookup of comments by recipe
CREATE INDEX idx_comments_recipe_id ON comments(recipe_id);

-- Fast lookup of comments by user
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- ==================================================
-- Row Level Security
-- ==================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Read public or own recipes"
ON recipes
FOR SELECT
USING (
  is_public = true
  OR auth.uid() = user_id
);

CREATE POLICY "Create own recipes"
ON recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own recipes"
ON recipes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Delete own recipes"
ON recipes
FOR DELETE
USING (auth.uid() = user_id);

-- Steps policies
CREATE POLICY "Read steps of accessible recipes"
ON steps
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = steps.recipe_id
    AND (recipes.is_public = true OR auth.uid() = recipes.user_id)
  )
);

CREATE POLICY "Manage steps of own recipes"
ON steps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = steps.recipe_id
    AND auth.uid() = recipes.user_id
  )
);

-- Recipe details policies
CREATE POLICY "Read recipe details for public or own recipes"
ON recipe_details
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_details.recipe_id
      AND (recipes.is_public = true OR recipes.user_id = auth.uid())
  )
);

CREATE POLICY "Create recipe details for own recipes"
ON recipe_details
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_details.recipe_id
      AND recipes.user_id = auth.uid()
  )
);

CREATE POLICY "Update recipe details for own recipes"
ON recipe_details
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_details.recipe_id
      AND recipes.user_id = auth.uid()
  )
);

CREATE POLICY "Delete recipe details for own recipes"
ON recipe_details
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_details.recipe_id
      AND recipes.user_id = auth.uid()
  )
);

-- Favorites policies
CREATE POLICY "Read own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Create own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);

-- Ratings policies
CREATE POLICY "Read own ratings"
ON ratings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Create or update own ratings"
ON ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own ratings"
ON ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Delete own ratings"
ON ratings
FOR DELETE
USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Read comments on accessible recipes"
ON comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = comments.recipe_id
    AND (recipes.is_public = true OR auth.uid() = recipes.user_id)
  )
);

CREATE POLICY "Create own comments"
ON comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own comments"
ON comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Delete own comments"
ON comments
FOR DELETE
USING (auth.uid() = user_id);

-- ==================================================
-- Functions
-- ==================================================

-- Fetch comments with author emails (SECURITY DEFINER to access auth.users)
CREATE OR REPLACE FUNCTION get_comments_with_email(p_recipe_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  user_id UUID,
  recipe_id INTEGER,
  content TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_email TEXT
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT c.id, c.user_id, c.recipe_id, c.content, c.created_at, c.updated_at, u.email AS user_email
  FROM comments c
  JOIN auth.users u ON c.user_id = u.id
  WHERE c.recipe_id = p_recipe_id
  ORDER BY c.created_at DESC;
$$;
