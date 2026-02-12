'use client'

import { useEffect, useMemo, useState } from 'react'

interface RecipeExperienceProps {
  recipeId: number
  ingredients: string[]
  steps: string[]
}

export default function RecipeExperience({ recipeId, ingredients, steps }: RecipeExperienceProps) {
  const ingredientKey = useMemo(() => `recipehub:ingredients:${recipeId}`, [recipeId])
  const stepKey = useMemo(() => `recipehub:steps:${recipeId}`, [recipeId])
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>(() =>
    loadChecklist(ingredientKey, ingredients.length)
  )
  const [checkedSteps, setCheckedSteps] = useState<boolean[]>(() =>
    loadChecklist(stepKey, steps.length)
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(ingredientKey, JSON.stringify(checkedIngredients))
  }, [checkedIngredients, ingredientKey])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(stepKey, JSON.stringify(checkedSteps))
  }, [checkedSteps, stepKey])

  const checkedIngredientCount = checkedIngredients.filter(Boolean).length
  const checkedStepCount = checkedSteps.filter(Boolean).length

  function toggleIngredient(index: number) {
    setCheckedIngredients(prev => prev.map((item, i) => (i === index ? !item : item)))
  }

  function toggleStep(index: number) {
    setCheckedSteps(prev => prev.map((item, i) => (i === index ? !item : item)))
  }

  return (
    <div className="space-y-8">
      <section className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Ingredients</h2>
          <span className="text-sm text-gray-600">
            {checkedIngredientCount}/{ingredients.length} ready
          </span>
        </div>
        {ingredients.length === 0 ? (
          <p className="text-gray-600">No ingredients listed.</p>
        ) : (
          <ul className="space-y-2">
            {ingredients.map((ingredient, index) => (
              <li key={`ingredient-${index}`} className="flex items-start gap-2">
                <input
                  id={`ingredient-${index}`}
                  type="checkbox"
                  checked={checkedIngredients[index] ?? false}
                  onChange={() => toggleIngredient(index)}
                  className="mt-1 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor={`ingredient-${index}`}
                  className={`cursor-pointer ${checkedIngredients[index] ? 'line-through text-gray-400' : 'text-gray-800'}`}
                >
                  {ingredient}
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Steps</h2>
          <span className="text-sm text-gray-600">
            {checkedStepCount}/{steps.length} completed
          </span>
        </div>
        {steps.length === 0 ? (
          <p className="text-gray-600">No cooking steps listed.</p>
        ) : (
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={`step-${index}`} className="flex items-start gap-3">
                <input
                  id={`step-${index}`}
                  type="checkbox"
                  checked={checkedSteps[index] ?? false}
                  onChange={() => toggleStep(index)}
                  className="mt-1 h-4 w-4 cursor-pointer"
                />
                <label
                  htmlFor={`step-${index}`}
                  className={`cursor-pointer ${checkedSteps[index] ? 'line-through text-gray-400' : 'text-gray-800'}`}
                >
                  <span className="font-semibold mr-2">Step {index + 1}:</span>
                  {step}
                </label>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  )
}

function loadChecklist(storageKey: string, count: number) {
  if (typeof window === 'undefined') {
    return Array.from({ length: count }, () => false)
  }

  const saved = localStorage.getItem(storageKey)
  if (!saved) {
    return Array.from({ length: count }, () => false)
  }

  try {
    const parsed = JSON.parse(saved) as boolean[]
    return Array.from({ length: count }, (_, index) => Boolean(parsed[index]))
  } catch {
    return Array.from({ length: count }, () => false)
  }
}
