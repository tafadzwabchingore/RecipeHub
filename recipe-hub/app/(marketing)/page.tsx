import Button from "@/components/Button";
import { getPublicRecipes } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard'
import SpoonacularRecipeCard, { SpoonacularRecipe } from '@/components/SpoonacularRecipeCard'
import { getDailyRecipes } from "@/lib/getDailyRecipes";
import FeatureSection from "@/components/FeatureSection";

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

export default async function MarketingPage() {
  const recipes = await getPublicRecipes()
  const featuredExternal = await getFeaturedExternalRecipes()

  return (
    <div className="flex flex-col gap-8">
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
        <div className="relative z-[1] text-white max-w-[800px] mx-auto px-8">
          <h1 className="font-bold text-4xl">Welcome to RecipeHub</h1>
          <p>Create, share, and discover recipes from home cooks everywhere.</p>
          <div className="mt-4 flex flex-row gap-4 justify-center">
            <Button variant="primary" href="/recipes">Browse Recipes</Button>
            <Button variant="secondary" href="/register">Get Started</Button>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-[800px] mx-auto px-8">
          <h2 className="text-2xl font-bold mb-4">Community Recipes</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {getDailyRecipes(recipes, 3).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      {featuredExternal.length > 0 && (
        <section className="py-8">
          <div className="max-w-[800px] mx-auto px-8">
            <h2 className="text-2xl font-bold mb-1">Featured Recipes</h2>
            <p className="text-gray-600 mb-4">Powered by Spoonacular. Updated every 10 minutes.</p>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {featuredExternal.map((recipe: SpoonacularRecipe) => (
                <SpoonacularRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        </section>
      )}

      <hr className="border-t border-gray-300 my-6"></hr>

      <FeatureSection 
        title="How it works"
        items={["Sign up for free", "Create and share recipes", "Rate, favorite, and build your collections"]}
        numbered
        className=""
      />

      <hr className="border-t border-gray-300 my-6"></hr>

      <FeatureSection
        title="Key Features"
        items={["Recipe creation with image uploads", "Browse community recipes", "Search by recipe name or ingredients", "Star ratings and favorites"]}
      />

      <hr className="border-t border-gray-300 my-6"></hr>

      <FeatureSection
        title="Who we are"
        items={["We're a team of students and home cooks who believe great recipes shouldn't be locked behind paywalls or lost in cluttered feeds", "RecipeHub is built to give everyday cooks a simple place to share what they make, discover new ideas, and save the recipes they love"]}
        titleAlign="center"
        plain
        className="bg-white text-gray-800"
      />

      <hr className="border-t border-gray-300 my-6"></hr>

      <FeatureSection 
        title="Ready to share your recipes?"
        titleAlign="center"
        Button={<Button className="text-center" variant="primary" href="/register">Get Started</Button>}
      />
    </div>
  );
}
