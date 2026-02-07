import { createClient } from '@/lib/supabase/client'
import { Recipe } from '@/types/recipe'

const supabase = createClient()

export async function getPublicRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getUserRecipes(userId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getUserFavoriteRecipes(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, recipes(*)')
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  return data
}

export async function createRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('recipes')
    .insert([recipe])
    .select()
    .single()

  if (error) throw new Error(error.message)
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

  if (error) throw new Error(error.message)
  return data
}

export async function deleteRecipe(id: number) {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function uploadRecipeImage(file: File) {
  const filePath = `${Date.now()}-${file.name}`

  const { error } = await supabase
    .storage
    .from('recipe-images')
    .upload(filePath, file)

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase
    .storage
    .from('recipe-images')
    .getPublicUrl(filePath)

  return publicUrl
}