'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Recipe } from '@/types/recipe'
import { Trash, Pencil, Star } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe
  showActions?: boolean
  onDelete?: (id: number) => void
  isFavorited?: boolean
  isOwner?: boolean
  initialRating?: number
  averageRating?: number
}

export default function RecipeCard({
  recipe,
  showActions = false,
  onDelete,
  isFavorited = false,
  isOwner = false,
  initialRating = 0,
  averageRating
}: RecipeCardProps) {
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
        body: JSON.stringify({ recipeId: recipe.id, rating: value })
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
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="p-3 flex flex-col justify-between min-h-44 gap-2">
        <h2 className="text-xl text-gray-800 font-semibold">{recipe.title}</h2>

        {recipe.description && (
          <p className="text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <FavoriteButton recipeId={recipe.id} initialFavorited={Boolean(isFavorited)} />
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

        <Link
          href={`/recipes/${recipe.id}`}
          className="text-sm text-orange-600 hover:underline"
        >
          View full recipe
        </Link>

        {showActions && (
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                recipe.is_public
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {recipe.is_public ? 'Public' : 'Private'}
            </span>

            <div className="flex gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/dashboard/edit/${recipe.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    <Pencil size={16} className="hover:scale-150 transition duration-200 hover:font-bold" />
                  </Link>
                  <button
                    onClick={() => onDelete?.(recipe.id)}
                    className="cursor-pointer text-red-600 text-sm hover:underline"
                  >
                    <Trash size={16} className="hover:scale-150 transition duration-200 hover:font-bold" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
