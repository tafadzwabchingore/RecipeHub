'use client'

import { FormEvent } from 'react'
import { createRecipe, uploadRecipeImage } from '@/lib/recipes'
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

    const title = form.get('title') as string
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    let image_url: string | undefined
    const imageFile = form.get('recipeImage') as File | null
    if (imageFile && imageFile.size > 0) {
      image_url = await uploadRecipeImage(imageFile)
    }

    await createRecipe({
      user_id: user.id,
      title,
      slug,
      description: form.get('description') as string,
      image_url,
      is_public: true,
    })

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col p-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Create Recipe</h1>

      <input 
        name="title" 
        placeholder="Title" 
        required 
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
      />

      <label className="
        block 
        mb-2.5 
        text-sm 
        font-medium 
        text-heading
      " 
      htmlFor="recipeImage">Recipe Image</label>
      <input className="
        cursor-pointer
        border
        rounded
        bg-gray-200
        transition
        duration-100
        hover:border-orange-500
        hover:shadow-md
        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-orange-500
        focus-visible:ring-offset-2
        file:mr-4 file:py-2 file:px-4
        file:rounded-l file:border-0
        file:text-sm file:font-semibold
        file:bg-gray-300 file:text-gray-700
        hover:file:bg-gray-400
        file:border-r file:border-gray-400
      "
      type="file" name="recipeImage" accept="image/*" />
      
      <textarea 
        name="description" 
        placeholder="Description" 
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

      <button 
        className="
          cursor-pointer
          bg-orange-500 
          text-white 
          px-4 
          py-2 
          rounded
          hover:bg-orange-600
          transition
          duration-250
        "
        type="submit"
      >
        Save Recipe
      </button>
    </form>
  )
}
