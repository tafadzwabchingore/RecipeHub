import Button from "@/components/Button";
import RecipeCard from "@/components/RecipeCard";
import SpoonacularRecipeCard, { SpoonacularRecipe } from "@/components/SpoonacularRecipeCard";
import { getPublicRecipes } from "@/lib/recipes";

async function getFeaturedExternalRecipes() {
  const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_KEY
  if (!apiKey) return []

  const params = new URLSearchParams({
    apiKey,
    number: '6'
  })

  const response = await fetch(
    `https://api.spoonacular.com/recipes/random?${params.toString()}`,
    { next: { revalidate: 600 } }
  )

  if (!response.ok) return []
  const data = await response.json()
  return (data?.recipes ?? []).map((recipe: SpoonacularRecipe) => ({
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    sourceUrl: recipe.sourceUrl
  }))
}

export default async function HomePage() {
  const featuredCommunity = await getPublicRecipes()
  const featuredExternal = await getFeaturedExternalRecipes()
  const featuredCommunityTop = featuredCommunity?.slice(0, 6) ?? []
  const mixedFeatured: Array<{ type: 'community'; data: typeof featuredCommunityTop[number] } | { type: 'external'; data: SpoonacularRecipe }> = [
    ...featuredCommunityTop.map(recipe => ({ type: 'community' as const, data: recipe })),
    ...featuredExternal.map(recipe => ({ type: 'external' as const, data: recipe }))
  ]

  for (let i = mixedFeatured.length - 1; i > 0; i -= 1) {
    const j = Math.floor((i + 1) * 0.41) % (i + 1)
    const temp = mixedFeatured[i]
    mixedFeatured[i] = mixedFeatured[j]
    mixedFeatured[j] = temp
  }

  return (
    <div className="flex-col gap-8">
      {/* Hero Section */}
      <section
        className="relative h-96 flex flex-col items-center justify-center text-center bg-cover bg-center"
        style={{ 
          height: '24rem',
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),url('/recipe_hub_hero_image.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: 'rgba(0,0,0,0.9)',
        }}
          
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content on top of the image */}
        <div className="relative z-[1] text-white">
          <h1 className="font-bold text-4xl">Welcome to RecipeHub</h1>
          <p>Create, share, and discover recipes from home cooks everywhere.</p>
          <div className="mt-4 flex flex-row gap-4 justify-center">
            <Button variant="primary" href="/recipes">Browse Recipes</Button>
            <Button variant="secondary" href="/register">Get Started</Button>
          </div>
        </div>
      </section>

      <section className="mt-8 p-8">
        <h2 className="text-2xl font-bold">Featured Recipes</h2>
        <p className="text-gray-600">Updated every 10 minutes.</p>
        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl mx-auto">
          {mixedFeatured.map(item =>
            item.type === 'community' ? (
              <RecipeCard key={`community-${item.data.id}`} recipe={item.data} />
            ) : (
              <SpoonacularRecipeCard key={`external-${item.data.id}`} recipe={item.data} />
            )
          )}
        </div>
      </section>
    </div>
  );
}
