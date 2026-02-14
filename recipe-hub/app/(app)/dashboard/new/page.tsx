'use client'

import { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { createRecipe, uploadRecipeImage, upsertRecipeDetails } from '@/lib/recipes'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewRecipePage() {
  const supabase = createClient()
  const router = useRouter()
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [steps, setSteps] = useState<string[]>([''])
  const [isSaving, setIsSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('')

  function updateItem(
    items: string[],
    index: number,
    value: string,
    setItems: Dispatch<SetStateAction<string[]>>
  ) {
    const next = [...items]
    next[index] = value
    setItems(next)
  }

  function addItem(setItems: Dispatch<SetStateAction<string[]>>) {
    setItems(prev => [...prev, ''])
  }

  function removeItem(index: number, setItems: Dispatch<SetStateAction<string[]>>) {
    setItems(prev => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    setStatusMessage('')
    setStatusType('')

    const form = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setStatusMessage('You must be logged in to save a recipe.')
      setStatusType('error')
      setIsSaving(false)
      return
    }

    const title = form.get('title') as string
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    let image_url: string | undefined
    const imageFile = form.get('recipeImage') as File | null
    if (imageFile && imageFile.size > 0) {
      image_url = await uploadRecipeImage(imageFile)
    }

    try {
      const recipe = await createRecipe({
        user_id: user.id,
        title,
        slug,
        description: form.get('description') as string,
        image_url,
        is_public: form.get('visibility') === 'public',
      })

      await upsertRecipeDetails(recipe.id, ingredients, steps)

      setStatusMessage('Recipe saved successfully. Redirecting to My Recipes...')
      setStatusType('success')
      setTimeout(() => router.push('/dashboard'), 1400)
    } catch {
      setStatusMessage('Failed to save recipe. Please try again.')
      setStatusType('error')
      setIsSaving(false)
    }
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

      <div className="space-y-2">
        <label className="block text-sm font-medium text-heading" htmlFor="visibility">
          Visibility
        </label>
        <select
          id="visibility"
          name="visibility"
          defaultValue="public"
          className="input rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 bg-gray-200 p-2"
        >
          <option value="public">Public (everyone can view)</option>
          <option value="private">Private (only you can view)</option>
        </select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <button
            type="button"
            onClick={() => addItem(setIngredients)}
            className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-100"
          >
            + Add ingredient
          </button>
        </div>
        {ingredients.map((ingredient, index) => (
          <div key={`ingredient-${index}`} className="flex gap-2">
            <input
              value={ingredient}
              onChange={(event) => updateItem(ingredients, index, event.target.value, setIngredients)}
              placeholder={`Ingredient ${index + 1}`}
              className="input rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 bg-gray-200 p-2 flex-1"
            />
            <button
              type="button"
              onClick={() => removeItem(index, setIngredients)}
              className="px-3 py-2 border rounded bg-white hover:bg-gray-100"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Steps</h2>
          <button
            type="button"
            onClick={() => addItem(setSteps)}
            className="text-sm px-3 py-1 border rounded bg-white hover:bg-gray-100"
          >
            + Add step
          </button>
        </div>
        {steps.map((step, index) => (
          <div key={`step-${index}`} className="flex gap-2">
            <textarea
              value={step}
              onChange={(event) => updateItem(steps, index, event.target.value, setSteps)}
              placeholder={`Step ${index + 1}`}
              className="input rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 bg-gray-200 p-2 flex-1"
              rows={3}
            />
            <button
              type="button"
              onClick={() => removeItem(index, setSteps)}
              className="px-3 py-2 border rounded bg-white hover:bg-gray-100 h-fit"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

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
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save Recipe'}
      </button>

      {statusMessage && (
        <p className={statusType === 'success' ? 'text-green-700' : 'text-red-700'}>
          {statusMessage}
        </p>
      )}
    </form>
  )
}
