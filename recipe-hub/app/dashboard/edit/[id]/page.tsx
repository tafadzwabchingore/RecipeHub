'use client'

import { useEffect, useState, FormEvent } from 'react'
import { updateRecipe } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditRecipePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const router = useRouter()
  const [recipe, setRecipe] = useState<any>(null)

  useEffect(() => {
    supabase
      .from('recipes')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => setRecipe(data))
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    await updateRecipe(Number(params.id), {
      title: form.get('title') as string,
      description: form.get('description') as string,
      ingredients: form.get('ingredients') as string,
      instructions: form.get('instructions') as string,
    })

    router.push('/dashboard')
  }

  if (!recipe) return <p>Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Edit Recipe</h1>

      <input name="title" defaultValue={recipe.title} />
      <textarea name="description" defaultValue={recipe.description} />
      <textarea name="ingredients" defaultValue={recipe.ingredients} />
      <textarea name="instructions" defaultValue={recipe.instructions} />

      <button className="bg-orange-500 text-white px-4 py-2 rounded">
        Update Recipe
      </button>
    </form>
  )
}
