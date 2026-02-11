'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'

export interface SpoonacularRecipe {
  id: number
  title: string
  image?: string
  summary?: string
  sourceUrl?: string
}

interface SpoonacularRecipeCardProps {
  recipe: SpoonacularRecipe
  initialFavorited?: boolean
  initialRating?: number
  averageRating?: number
}

export default function SpoonacularRecipeCard({
  recipe,
  initialFavorited,
  initialRating = 0,
  averageRating
}: SpoonacularRecipeCardProps) {
  const [rating, setRating] = useState(initialRating)
  const [ratingLoading, setRatingLoading] = useState(false)

  async function handleRate(value: number) {
    if (ratingLoading) return
    const prev = rating
    setRating(value)
    setRatingLoading(true)
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "spoonacular", externalId: recipe.id, rating: value })
      })
      if (!res.ok) throw new Error("Request failed")
    } catch {
      setRating(prev)
    } finally {
      setRatingLoading(false)
    }
  }

  return (
    <div className="border border-gray-400 bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="p-3 flex flex-col justify-between h-44">
        <h2 className="text-xl font-semibold">{recipe.title}</h2>

        {recipe.summary && (
          <p className="text-gray-600 mt-1 line-clamp-2">{recipe.summary}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <FavoriteButton
              source="spoonacular"
              externalId={recipe.id}
              title={recipe.title}
              imageUrl={recipe.image}
              sourceUrl={recipe.sourceUrl}
              initialFavorited={Boolean(initialFavorited)}
            />
            <span className="text-xs text-gray-500">Like</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
              >
                <Star
                  className={`w-4 h-4 transition ${
                    value <= rating ? 'text-orange-500 fill-orange-500' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
        {averageRating && averageRating > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>{averageRating.toFixed(1)} avg</span>
          </div>
        )}

        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-orange-600 hover:underline mt-2"
          >
            View full recipe
          </a>
        )}
      </div>
    </div>
  )
}
