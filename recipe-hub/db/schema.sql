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

-- Favorites Table
-- Tracks which users have favorited which recipes
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_id)
);

-- ==================================================
-- Indexes for common queries
-- ==================================================

-- Fast Lookup of Recipes by author
CREATE INDEX idx_recipes_user_id ON recipes(user_id);

-- Fast lookup of steps by recipe
CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);

-- Search recipes by title (case-insensitive)
CREATE INDEX idx_recipes_title ON recipes(LOWER(title));

-- Fast lookup of favorites by user
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- ==================================================
-- Row Level Security
-- ==================================================

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies (Users can only manage their own recipes)
-- Read recipes (public or own)
CREATE POLICY "Read public or own recipes"
ON recipes
FOR SELECT
USING (
  is_public = true
  OR auth.uid() = user_id
);

-- Create recipe (owner only)
CREATE POLICY "Create own recipes"
ON recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update policy (owner only)
CREATE POLICY "Update own recipes"
ON recipes
FOR UPDATE
USING (auth.uid() = user_id);

-- Delete policy (owner only)
CREATE POLICY "Delete own recipes"
ON recipes
FOR DELETE
USING (auth.uid() = user_id);

-- Steps: readable if parent recipe is readable
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

-- Steps: writable only by recipe owner
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

-- Favorites: users can read their own favorites
CREATE POLICY "Read own favorites"
ON favorites
FOR SELECT
USING (auth.uid() = user_id);

-- Favorites: users can add their own favorites
CREATE POLICY "Create own favorites"
ON favorites
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Favorites: users can remove their own favorites
CREATE POLICY "Delete own favorites"
ON favorites
FOR DELETE
USING (auth.uid() = user_id);
