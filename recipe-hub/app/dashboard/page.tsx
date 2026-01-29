'use client'

import { useEffect, useState } from 'react'
import { getUserRecipes, deleteRecipe } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Recipe } from '@/types/recipe'

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
  }, [])

  async function handleDelete(id: number) {
    if (!confirm('Delete this recipe?')) return
    await deleteRecipe(id)
    setRecipes(recipes.filter(r => r.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link
          href="/dashboard/new"
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          + New Recipe
        </Link>
      </div>

      {recipes.length === 0 && <p>No recipes yet.</p>}

      <ul className="space-y-4">
        {recipes.map(recipe => (
          <li
            key={recipe.id}
            className="border p-4 rounded flex justify-between"
          >
            <div>
              <h2 className="font-semibold">{recipe.title}</h2>
              <p className="text-sm text-gray-500">
                {recipe.is_public ? 'Public' : 'Private'}
              </p>
            </div>

            <div className="flex gap-4">
              <Link
                href={`/dashboard/edit/${recipe.id}`}
                className="text-blue-600"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}