'use client'

import { use, useEffect, useState, FormEvent } from 'react'
import { getRecipeById, updateRecipe, uploadRecipeImage } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Recipe } from '@/types/recipe'

export default function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const supabase = createClient()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to edit recipes.')
        return
      }

      try {
        const data = await getRecipeById(Number(id))
        if (data.user_id !== user.id) {
          setError('You do not have permission to edit this recipe.')
          return
        }
        setRecipe(data)
      } catch {
        setError('Recipe not found.')
      }
    }
    load()
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    let image_url: string | undefined
    const imageFile = form.get('recipeImage') as File | null
    if (imageFile && imageFile.size > 0) {
      image_url = await uploadRecipeImage(imageFile)
    }

    await updateRecipe(Number(id), {
      title: form.get('title') as string,
      description: form.get('description') as string,
      ...(image_url && { image_url }),
    })

    router.push('/dashboard')
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>
  if (!recipe) return <p className="p-6">Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Recipe</h1>

      <input name="title" defaultValue={recipe.title} className="
          input
          rounded
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-orange-500
          focus-visible:ring-offset-2
          bg-gray-200
          p-2
        "  />

      <label className="
        block
        mb-2.5
        text-sm
        font-medium
        text-heading
      "
      htmlFor="recipeImage">Recipe Image</label>

      {recipe.image_url && (
        <img src={recipe.image_url} alt="Current" className="w-full h-48 object-cover rounded" />
      )}

      <input className="
        cursor-pointer
        border
        rounded
        bg-gray-200
        transition
        duration-100
        hover:border-orange-500
        hover:shadow-md
        file:mr-4 file:py-2 file:px-4
        file:rounded-l file:border-0
        file:text-sm file:font-semibold
        file:bg-gray-300 file:text-gray-700
        hover:file:bg-gray-400
        file:border-r file:border-gray-400
      "
      type="file" name="recipeImage" accept="image/*" />

      <textarea name="description" defaultValue={recipe.description}
        className="
          input
          rounded
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-orange-500
          focus-visible:ring-offset-2
          bg-gray-200
          p-2
          "
        rows={10}
      />

      <button className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-200" type="submit">
        Update Recipe
      </button>
    </form>
  )
}
