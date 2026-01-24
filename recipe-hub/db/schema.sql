-- ==================================================
-- RecipeHub Database Schema
-- Foundational Phase Tables: users, recipes, steps
-- ==================================================

-- Users Table
-- User Account Information & Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
-- Recipe Metadata & Link to Author
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE
);

-- Steps Table
-- Stores step-by-step cooking istructions
CREATE TABLE steps (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    UNIQUE(recipe_id, step_order)
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

-- Enable RLS
alter table users enable row level security;
alter table recipes enable row level security;
alter table steps enable row level security;

-- Policies (Users can only manage their own recipes)
-- Read recipes (public or own)
create policy "Read public or own recipes"
on recipes
for select
using (
  is_public = true
  OR auth.uid() = user_id
);

-- Create recipe (owner only)
create policy "Create own recipes"
on recipes
for insert
with check (auth.uid() = user_id);

-- Update policy (owner only)
create policy "Update own recipes"
on recipes
for update
using (auth.uid() = user_id);

-- Delete policy (owner only)
create policy "Delete own recipes"
on recipes
for delete
using (auth.uid() = user_id);
