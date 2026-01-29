import { supabase } from '@/lib/supabase/client'
import { Recipe } from '@/types/recipe'

export async function getUserRecipes(userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateRecipe(
  id: number,
  updates: Partial<Recipe>
) {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteRecipe(id: number) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) throw error
}