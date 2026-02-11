'use client'

import { useEffect, useState } from 'react'
import { getUserRecipes, deleteRecipe } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Recipe } from '@/types/recipe'
import RecipeCard from '@/components/RecipeCard'
import { HeartIcon } from 'lucide-react'

export default function DashboardPage() {
  const supabase = createClient()
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const recipes = await getUserRecipes(user.id)
      setRecipes(recipes)
    }
    load()
  }, [supabase])

  async function handleDelete(id: number) {
    if (!confirm('Delete this recipe?')) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const recipe = recipes.find(r => r.id === id)
    if (!recipe || recipe.user_id !== user.id) {
      alert('You do not have permission to delete this recipe.')
      return
    }

    try {
      await deleteRecipe(id)
      setRecipes(recipes.filter(r => r.id !== id))
    } catch {
      alert('Failed to delete recipe.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <div className='flex justify-between items-center'>
          <Link
          href="/dashboard/new"
          className="bg-orange-500 text-white px-4 py-2 rounded mr-4"
        >
          + New Recipe
        </Link>
        <Link href="dashboard/favorites">
          <HeartIcon className="w-6 h-6 text-orange-500" />
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
            isOwner
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}