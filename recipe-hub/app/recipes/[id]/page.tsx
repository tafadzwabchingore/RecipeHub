import { notFound } from 'next/navigation'
import RecipeExperience from '@/components/RecipeExperience'
import { createClient, getServerUser } from '@/lib/supabase/server'

type RecipeWithDetails = {
  id: number
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  is_public: boolean
  recipe_details: {
    ingredients: string[] | null
    steps: string[] | null
  } | null
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const recipeId = Number(id)

  if (Number.isNaN(recipeId)) notFound()

  const [supabase, user] = await Promise.all([createClient(), getServerUser()])
  const { data } = await supabase
    .from('recipes')
    .select('id, user_id, title, description, image_url, is_public, recipe_details(ingredients, steps)')
    .eq('id', recipeId)
    .single()

  const recipe = data as RecipeWithDetails | null

  if (!recipe) notFound()
  if (!recipe.is_public && recipe.user_id !== user?.id) notFound()

  const ingredients = Array.isArray(recipe.recipe_details?.ingredients) ? recipe.recipe_details.ingredients : []
  const steps = Array.isArray(recipe.recipe_details?.steps) ? recipe.recipe_details.steps : []

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-gray-700">{recipe.description}</p>
        )}
      </div>

      {recipe.image_url ? (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full max-h-[420px] object-cover rounded-lg border"
        />
      ) : (
        <div className="w-full h-64 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-500">
          No Image
        </div>
      )}

      <RecipeExperience recipeId={recipe.id} ingredients={ingredients} steps={steps} />
    </div>
  )
}
