'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'
import SpoonacularRecipeCard, { SpoonacularRecipe } from '@/components/SpoonacularRecipeCard'

export default function FavoritesPage() {
  const supabase = createClient()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [spoonacularFavorites, setSpoonacularFavorites] = useState<SpoonacularRecipe[]>([])
  const [ratingMap, setRatingMap] = useState<Map<number, number>>(new Map())
  const [externalRatingMap, setExternalRatingMap] = useState<Map<number, number>>(new Map())
  const [averageRatingMap, setAverageRatingMap] = useState<Map<number, number>>(new Map())
  const [externalAverageRatingMap, setExternalAverageRatingMap] = useState<Map<number, number>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: favorites } = await supabase
        .from('favorites')
        .select('recipe_id, source, external_id, title, image_url, source_url, recipes(*)')
        .eq('user_id', user.id)

      const community: Recipe[] = []
      const external: SpoonacularRecipe[] = []

      favorites?.forEach((fav: {
        recipe_id: number | null
        source: string | null
        external_id: number | null
        title: string | null
        image_url: string | null
        source_url: string | null
        recipes: Recipe[] | Recipe | null
      }) => {
        if (fav.recipe_id && fav.recipes) {
          const r = Array.isArray(fav.recipes) ? fav.recipes[0] : fav.recipes
          if (r) community.push(r)
        } else if (fav.external_id && fav.source === 'spoonacular') {
          external.push({
            id: fav.external_id,
            title: fav.title ?? 'Untitled Recipe',
            image: fav.image_url ?? undefined,
            sourceUrl: fav.source_url ?? undefined
          })
        }
      })

      setRecipes(community)
      setSpoonacularFavorites(external)

      const { data: ratings } = await supabase
        .from('ratings')
        .select('recipe_id, source, external_id, rating')
        .eq('user_id', user.id)

      const rMap = new Map<number, number>()
      const exRMap = new Map<number, number>()
      ratings?.forEach((row: { recipe_id: number | null; source: string | null; external_id: number | null; rating: number }) => {
        if (row.recipe_id) rMap.set(row.recipe_id, row.rating)
        if (row.external_id && row.source === 'spoonacular') exRMap.set(row.external_id, row.rating)
      })
      setRatingMap(rMap)
      setExternalRatingMap(exRMap)

      if (community.length > 0) {
        const ids = community.map(recipe => recipe.id)
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

      if (external.length > 0) {
        const ids = external.map(recipe => recipe.id)
        const { data: avgRows } = await supabase
          .from('ratings')
          .select('external_id, rating')
          .eq('source', 'spoonacular')
          .in('external_id', ids)

        const avgBuckets = new Map<number, { sum: number; count: number }>()
        avgRows?.forEach((row: { external_id: number | null; rating: number }) => {
          if (!row.external_id) return
          const current = avgBuckets.get(row.external_id) ?? { sum: 0, count: 0 }
          avgBuckets.set(row.external_id, { sum: current.sum + row.rating, count: current.count + 1 })
        })

        const averages = new Map<number, number>()
        avgBuckets.forEach((value, key) => {
          averages.set(key, value.sum / value.count)
        })
        setExternalAverageRatingMap(averages)
      }

      setLoading(false)
    }
    load()
  }, [supabase])

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Favorites</h1>
          <p className="text-gray-600">All the recipes you liked.</p>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && recipes.length === 0 && spoonacularFavorites.length === 0 && <p>No favorite recipes yet.</p>}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            isFavorited
            initialRating={ratingMap.get(recipe.id) ?? 0}
            averageRating={averageRatingMap.get(recipe.id) ?? 0}
          />
        ))}
        {spoonacularFavorites.map(recipe => (
          <SpoonacularRecipeCard
            key={recipe.id}
            recipe={recipe}
            initialFavorited
            initialRating={externalRatingMap.get(recipe.id) ?? 0}
            averageRating={externalAverageRatingMap.get(recipe.id) ?? 0}
          />
        ))}
      </div>
    </div>
  )
}
