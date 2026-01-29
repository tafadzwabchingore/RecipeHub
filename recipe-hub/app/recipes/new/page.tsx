'use client'

import { createRecipe } from '@/lib/recipes'
import { useState } from 'react'

export default function NewRecipePage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    await createRecipe({
      title,
      description,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      user_id: 'TEMP_USER_ID',
      is_public: isPublic,
    })

    alert('Recipe created!')
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <input
        placeholder="Title"
        className="border p-2 w-full"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Description"
        className="border p-2 w-full"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <label className="flex gap-2">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={() => setIsPublic(!isPublic)}
        />
        Public recipe
      </label>

      <button className="bg-orange-500 text-white px-4 py-2 rounded">
        Create Recipe
      </button>
    </form>
  )
}