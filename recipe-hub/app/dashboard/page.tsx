'use client'

import { useEffect, useState } from 'react'
import { getUserRecipes, deleteRecipe } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'

export default function DashboardPage() {
  const supabase = createClient()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set())
  const [ratingMap, setRatingMap] = useState<Map<number, number>>(new Map())
  const [averageRatingMap, setAverageRatingMap] = useState<Map<number, number>>(new Map())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const recipes = await getUserRecipes(user.id)
      setRecipes(recipes)

      const [{ data: favorites }, { data: ratings }] = await Promise.all([
        supabase
          .from('favorites')
          .select('recipe_id')
          .eq('user_id', user.id),
        supabase
          .from('ratings')
          .select('recipe_id, rating')
          .eq('user_id', user.id)
      ])

      const favSet = new Set<number>()
      favorites?.forEach((fav: { recipe_id: number | null }) => {
        if (fav.recipe_id) favSet.add(fav.recipe_id)
      })
      setFavoriteIds(favSet)

      const ratingMap = new Map<number, number>()
      ratings?.forEach((row: { recipe_id: number | null; rating: number }) => {
        if (row.recipe_id) ratingMap.set(row.recipe_id, row.rating)
      })
      setRatingMap(ratingMap)

      if (recipes.length > 0) {
        const ids = recipes.map(recipe => recipe.id)
        const { data: avgRows } = await supabase
          .from('ratings')
          .select('recipe_id, rating')
          .in('recipe_id', ids)

        const avgBuckets = new Map<number, { sum: number; count: number }>()
        avgRows?.forEach((row: { recipe_id: number | null; rating: number }) => {
          if (!row.recipe_id) return
          const current = avgBuckets.get(row.recipe_id) ?? { sum: 0, count: 0 }
          avgBuckets.set(row.recipe_id, { sum: current.sum + row.rating, count: current.count + 1 })
        })

        const averages = new Map<number, number>()
        avgBuckets.forEach((value, key) => {
          averages.set(key, value.sum / value.count)
        })
        setAverageRatingMap(averages)
      }
    }
    load()
  }, [supabase])

  async function handleDelete(id: number) {
    if (!confirm('Delete this recipe?')) return
    await deleteRecipe(id)
    setRecipes(recipes.filter(r => r.id !== id))
  }


  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">My Recipes</h1>
          <p className="text-gray-600">Create, edit, or delete your recipes.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/dashboard/new"
            className="bg-orange-500 text-white px-4 py-2 rounded shadow-sm hover:bg-orange-600 transition text-center"
          >
            + New Recipe
          </Link>
        </div>
      </div>

      {recipes.length === 0 && <p>No recipes yet.</p>}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            showActions
            onDelete={handleDelete}
            isFavorited={favoriteIds.has(recipe.id)}
            initialRating={ratingMap.get(recipe.id) ?? 0}
            averageRating={averageRatingMap.get(recipe.id) ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
