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

-- Recipe Details Table
-- Stores checklist-friendly ingredients and steps for each recipe
CREATE TABLE recipe_details (
    recipe_id INTEGER PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
    ingredients TEXT[] DEFAULT ARRAY[]::TEXT[],
    steps TEXT[] DEFAULT ARRAY[]::TEXT[],
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

-- Enable RLS
alter table users enable row level security;
alter table recipes enable row level security;
alter table steps enable row level security;
alter table recipe_details enable row level security;

-- Favorites Table
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
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
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    source VARCHAR(50) DEFAULT 'community',
    external_id INTEGER,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipe_id),
    UNIQUE (user_id, source, external_id)
);

alter table favorites enable row level security;
alter table ratings enable row level security;

create policy "Read own favorites"
on favorites
for select
using (auth.uid() = user_id);

create policy "Create own favorites"
on favorites
for insert
with check (auth.uid() = user_id);

create policy "Delete own favorites"
on favorites
for delete
using (auth.uid() = user_id);

create policy "Read own ratings"
on ratings
for select
using (auth.uid() = user_id);

create policy "Create or update own ratings"
on ratings
for insert
with check (auth.uid() = user_id);

create policy "Update own ratings"
on ratings
for update
using (auth.uid() = user_id);

create policy "Delete own ratings"
on ratings
for delete
using (auth.uid() = user_id);

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

-- Read checklist details for public recipes or owner recipes
create policy "Read recipe details for public or own recipes"
on recipe_details
for select
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_details.recipe_id
      and (recipes.is_public = true or recipes.user_id = auth.uid())
  )
);

-- Create checklist details for own recipes
create policy "Create recipe details for own recipes"
on recipe_details
for insert
with check (
  exists (
    select 1 from recipes
    where recipes.id = recipe_details.recipe_id
      and recipes.user_id = auth.uid()
  )
);

-- Update checklist details for own recipes
create policy "Update recipe details for own recipes"
on recipe_details
for update
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_details.recipe_id
      and recipes.user_id = auth.uid()
  )
);

-- Delete checklist details for own recipes
create policy "Delete recipe details for own recipes"
on recipe_details
for delete
using (
  exists (
    select 1 from recipes
    where recipes.id = recipe_details.recipe_id
      and recipes.user_id = auth.uid()
  )
);
