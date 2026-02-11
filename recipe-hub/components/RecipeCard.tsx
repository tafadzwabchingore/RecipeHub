'use client'

import Link from 'next/link'
import { Recipe } from '@/types/recipe'
import { Trash, Pencil } from 'lucide-react';
import { FavoriteButton } from './FavoriteButton';

interface RecipeCardProps {
  recipe: Recipe
  showActions?: boolean
  onDelete?: (id: number) => void
  isFavorited?: boolean
  isOwner?: boolean
}

export default function RecipeCard({ recipe, showActions = false, onDelete, isFavorited = false, isOwner = false }: RecipeCardProps) {

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

      <div className="p-3 flex flex-col justify-between h-40">
        <h2 className="text-xl text-gray-800 font-semibold">{recipe.title}</h2>

        {recipe.description && (
          <p className="text-gray-600 mt-1 line-clamp-2">{recipe.description}</p>
        )}

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
              <FavoriteButton recipeId={recipe.id} initialFavorited={isFavorited} />
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
