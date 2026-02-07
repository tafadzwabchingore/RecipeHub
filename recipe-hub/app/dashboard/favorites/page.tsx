'use client'

import { useEffect, useState } from 'react'
import { getUserFavoriteRecipes } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'

export default function FavoritesPage() {
  const supabase = createClient()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const favorites = await getUserFavoriteRecipes(user.id)
      setRecipes(favorites.map((f: { recipes: Recipe; }) => f.recipes))
      setIsFavorited(favorites.some((f: { recipes: Recipe; }) => f.recipes))
    }
    load()
  }, [supabase, recipes])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Favorite Recipes</h1>
      </div>

      {recipes.length === 0 && <p>No recipes yet.</p>}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions
            isFavorited={isFavorited}
          />
        ))}
      </div>
    </div>
  )
}