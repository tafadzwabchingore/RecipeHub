'use client'

import { FormEvent } from 'react'
import { createRecipe } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewRecipePage() {
  const supabase = createClient()
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await createRecipe({
      user_id: user.id,
      title: form.get('title') as string,
      description: form.get('description') as string,
      ingredients: form.get('ingredients') as string,
      instructions: form.get('instructions') as string,
      is_public: true,
    })

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create Recipe</h1>

      <input name="title" placeholder="Title" required className="input" />
      <textarea name="description" placeholder="Description" />
      <textarea name="ingredients" placeholder="Ingredients" required />
      <textarea name="instructions" placeholder="Instructions" required />

      <button className="bg-orange-500 text-white px-4 py-2 rounded">
        Save Recipe
      </button>
    </form>
  )
}
