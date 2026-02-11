import { getPublicRecipes } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard'
import SpoonacularRecipeCard, { SpoonacularRecipe } from '@/components/SpoonacularRecipeCard'
import { createClient, getServerUser } from '@/lib/supabase/server'

type SearchParams = {
  q?: string
  mode?: string
}

function stripHtml(input?: string) {
  if (!input) return ''
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function getSpoonacularRecipes(query: string, mode: 'name' | 'ingredients') {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_KEY
  if (!apiKey || !query) return []

  const params = new URLSearchParams({
    apiKey,
    number: '12',
    addRecipeInformation: 'true',
    fillIngredients: 'false'
  })

  if (mode === 'ingredients') {
    params.set('includeIngredients', query)
  } else {
    params.set('query', query)
  }

  const response = await fetch(
    `https://api.spoonacular.com/recipes/complexSearch?${params.toString()}`,
    { cache: 'no-store' }
  )

  if (!response.ok) return []

  const data = await response.json()
  return (data?.results ?? []).map((recipe: SpoonacularRecipe & { summary?: string }) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    summary: stripHtml(recipe.summary),
    sourceUrl: recipe.sourceUrl
  }))
}

export default async function BrowseRecipesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const recipes = await getPublicRecipes()
  const params = await searchParams
  const query = params?.q?.trim() ?? ''
  const mode = (params?.mode === 'ingredients' ? 'ingredients' : 'name') as 'name' | 'ingredients'
  const spoonacularRecipes: SpoonacularRecipe[] = query ? await getSpoonacularRecipes(query, mode) : []
  const spoonacularKeyMissing = !process.env.NEXT_PUBLIC_SPOONACULAR_KEY
  const user = await getServerUser()
  const communityFavorites = new Set<number>()
  const externalFavorites = new Set<number>()
  const communityRatings = new Map<number, number>()
  const externalRatings = new Map<number, number>()
  const communityAverageRatings = new Map<number, number>()
  const externalAverageRatings = new Map<number, number>()

  if (user) {
    const supabase = await createClient()
    const [{ data: favorites }, { data: ratings }] = await Promise.all([
      supabase
        .from('favorites')
        .select('recipe_id, source, external_id')
        .eq('user_id', user.id),
      supabase
        .from('ratings')
        .select('recipe_id, source, external_id, rating')
        .eq('user_id', user.id)
    ])

    favorites?.forEach((fav: { recipe_id: number | null; source: string | null; external_id: number | null }) => {
      if (fav.recipe_id) communityFavorites.add(fav.recipe_id)
      if (fav.external_id && fav.source === 'spoonacular') externalFavorites.add(fav.external_id)
    })

    ratings?.forEach((row: { recipe_id: number | null; source: string | null; external_id: number | null; rating: number }) => {
      if (row.recipe_id) communityRatings.set(row.recipe_id, row.rating)
      if (row.external_id && row.source === 'spoonacular') externalRatings.set(row.external_id, row.rating)
    })
  }

  const supabase = await createClient()
  const communityIds = recipes?.map(recipe => recipe.id) ?? []
  if (communityIds.length > 0) {
    const { data: communityRatingRows } = await supabase
      .from('ratings')
      .select('recipe_id, rating')
      .in('recipe_id', communityIds)

    const ratingBuckets = new Map<number, { sum: number; count: number }>()
    communityRatingRows?.forEach((row: { recipe_id: number | null; rating: number }) => {
      if (!row.recipe_id) return
      const current = ratingBuckets.get(row.recipe_id) ?? { sum: 0, count: 0 }
      ratingBuckets.set(row.recipe_id, { sum: current.sum + row.rating, count: current.count + 1 })
    })
    ratingBuckets.forEach((value, key) => {
      communityAverageRatings.set(key, value.sum / value.count)
    })
  }

  const externalIds = spoonacularRecipes.map(recipe => recipe.id)
  if (externalIds.length > 0) {
    const { data: externalRatingRows } = await supabase
      .from('ratings')
      .select('external_id, rating')
      .eq('source', 'spoonacular')
      .in('external_id', externalIds)

    const ratingBuckets = new Map<number, { sum: number; count: number }>()
    externalRatingRows?.forEach((row: { external_id: number | null; rating: number }) => {
      if (!row.external_id) return
      const current = ratingBuckets.get(row.external_id) ?? { sum: 0, count: 0 }
      ratingBuckets.set(row.external_id, { sum: current.sum + row.rating, count: current.count + 1 })
    })
    ratingBuckets.forEach((value, key) => {
      externalAverageRatings.set(key, value.sum / value.count)
    })
  }

  const normalizedQuery = query.toLowerCase()
  const filteredCommunity = query
    ? recipes.filter(recipe =>
        recipe.title?.toLowerCase().includes(normalizedQuery) ||
        recipe.description?.toLowerCase().includes(normalizedQuery)
      )
    : recipes

  const mixedResults: Array<{ type: 'community'; data: typeof recipes[number] } | { type: 'external'; data: SpoonacularRecipe }> = [
    ...filteredCommunity.map(recipe => ({ type: 'community' as const, data: recipe })),
    ...spoonacularRecipes.map(recipe => ({ type: 'external' as const, data: recipe }))
  ]

  for (let i = mixedResults.length - 1; i > 0; i -= 1) {
    const j = Math.floor((i + 1) * 0.37) % (i + 1)
    const temp = mixedResults[i]
    mixedResults[i] = mixedResults[j]
    mixedResults[j] = temp
  }

  return (
    <div className="p-6 space-y-12">
      <section className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Browse Recipes</h1>
          <p className="text-gray-600">
            Search recipes by name or ingredients.
          </p>
        </div>
        <form method="get" className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder={mode === 'ingredients' ? 'e.g. chicken, garlic, lemon' : 'e.g. pasta carbonara'}
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full sm:w-96 bg-white shadow-sm"
          />
          <select
            name="mode"
            defaultValue={mode}
            className="border border-gray-300 rounded-lg px-4 py-2.5 w-full sm:w-56 bg-white shadow-sm"
          >
            <option value="name">Search by name</option>
            <option value="ingredients">Search by ingredients</option>
          </select>
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2.5 rounded-lg w-full sm:w-auto hover:bg-orange-600 transition"
          >
            Search
          </button>
        </form>
        {spoonacularKeyMissing && (
          <p className="text-sm text-red-600 mt-3">
            External search is unavailable. Set `NEXT_PUBLIC_SPOONACULAR_KEY` to enable it.
          </p>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Results</h2>
          {query.length > 0 && (
            <span className="text-sm text-gray-500">Showing results for "{query}"</span>
          )}
        </div>

        {query.length > 0 && mixedResults.length === 0 && (
          <p className="text-gray-600">
            No recipes found for &quot;{query}&quot;.
          </p>
        )}

        {query.length === 0 && mixedResults.length === 0 && (
          <p className="text-gray-600">
            No recipes available yet.
          </p>
        )}

        {mixedResults.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
            {mixedResults.map(item =>
              item.type === 'community' ? (
                <RecipeCard
                  key={`community-${item.data.id}`}
                  recipe={item.data}
                  isFavorited={communityFavorites.has(item.data.id)}
                  initialRating={communityRatings.get(item.data.id) ?? 0}
                  averageRating={communityAverageRatings.get(item.data.id) ?? 0}
                />
              ) : (
                <SpoonacularRecipeCard
                  key={`external-${item.data.id}`}
                  recipe={item.data}
                  initialFavorited={externalFavorites.has(item.data.id)}
                  initialRating={externalRatings.get(item.data.id) ?? 0}
                  averageRating={externalAverageRatings.get(item.data.id) ?? 0}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  )
}
