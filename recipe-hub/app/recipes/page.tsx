import { getPublicRecipes } from '@/lib/recipes'
import { updateRecipe } from '@/lib/recipes';
import { deleteRecipe } from '@/lib/recipes'

export default async function BrowseRecipesPage() {
  const recipes = await getPublicRecipes()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Recipes</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {recipes?.map(recipe => (
          <div
            key={recipe.id}
            className="border rounded-lg p-4 hover:shadow"
          >
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}