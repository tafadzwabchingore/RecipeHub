import type { Metadata} from 'next'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description, image_url')
    .eq('id', id)
    .single()

  return {
    title: recipe?.title ?? 'Recipe',
    description: recipe?.description ?? 'Check out this recipe on Recipe Hub!',
    openGraph: {
      title: recipe?.title ?? 'Recipe',
      description: recipe?.description ?? '',
      images: recipe?.image_url ? [recipe.image_url] : [],
    },
  }
}

export default function RecipeLayout({ children }: { children: React.ReactNode }) {
    return children
}