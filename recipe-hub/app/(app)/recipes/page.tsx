import { getPublicRecipes } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard'

export default async function BrowseRecipesPage() {
  const recipes = await getPublicRecipes()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Recipes</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
        {recipes?.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  )
}
