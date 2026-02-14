'use client'

import { use, useEffect, useState } from 'react'
import { getRecipeById, getRecipeDetails } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/recipe'
import { FavoriteButton } from '@/components/FavoriteButton'
import RecipeExperience from '@/components/RecipeExperience'
import CommentsSection from '@/components/CommentsSection'
import { RecipeDetails } from '@/types/recipe'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [details, setDetails] = useState<RecipeDetails | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) setUserId(user.id)

        const [data, recipeDetails] = await Promise.all([
          getRecipeById(Number(id)),
          getRecipeDetails(Number(id))
        ])
        setRecipe(data)
        setDetails(recipeDetails)
      } catch {
        setError('Recipe not found.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return <div className="p-8 text-gray-500">Loading recipe...</div>
  }

  if (error || !recipe) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || 'Recipe not found.'}</p>
        <Link href="/recipes" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to recipes
        </Link>
      </div>
    )
  }

  const isOwner = userId === recipe.user_id

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Link href="/recipes" className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={16} />
        Back to recipes
      </Link>

      {recipe.image_url && (
        <img
          src={recipe.image_url}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900">{recipe.title}</h1>
        <div className="flex items-center gap-3 shrink-0">
          <FavoriteButton recipeId={recipe.id} initialFavorited={false} />
          {isOwner && (
            <Link
              href={`/dashboard/edit/${recipe.id}`}
              className="text-sm bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
            >
              Edit
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            recipe.is_public
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {recipe.is_public ? 'Public' : 'Private'}
        </span>
        {recipe.created_at && (
          <span className="text-sm text-gray-500">
            {new Date(recipe.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {recipe.description && (
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{recipe.description}</p>
        </div>
      )}

      <RecipeExperience
        recipeId={recipe.id}
        ingredients={details?.ingredients ?? []}
        steps={details?.steps ?? []}
      />

      <CommentsSection recipeId={recipe.id} userId={userId} />
    </div>
  )
}
