import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import Link from 'next/link';

type Recipe = {
  id: number;
  user_id: number;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export default async function RecipesPage() {
  // Fetch public recipes from Supabase
  const { data: recipes, error } = await supabase
    .from<Recipe>('recipes')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    return <p className="p-4 text-red-500">Error fetching recipes: {error.message}</p>;
  }

  if (!recipes || recipes.length === 0) {
    return <p className="p-4">No recipes found.</p>;
  }

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          {recipe.image_url && (
            <Image
              src={recipe.image_url}
              alt={recipe.title}
              width={400}
              height={250}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{recipe.title}</h2>
            <p className="text-gray-600 mb-2">{recipe.description}</p>
            <Link
              href={`/recipes/${recipe.slug}`}
              className="text-blue-600 hover:underline"
            >
              View Recipe
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}