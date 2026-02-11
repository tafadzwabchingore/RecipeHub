import Button from "@/components/Button";
import { getPublicRecipes } from '@/lib/recipes'
import RecipeCard from '@/components/RecipeCard'
import { getDailyRecipes } from "@/lib/getDailyRecipes";

export default async function MarketingPage() {

  const recipes = await getPublicRecipes()

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
        <div className="relative z-[1] text-white">
          <h1 className="font-bold text-4xl">Welcome to RecipeHub</h1>
          <p>Create, share, and discover recipes from home cooks everywhere.</p>
          <div className="mt-4 flex flex-row gap-4 justify-center">
            <Button variant="primary" href="/recipes">Browse Recipes</Button>
            <Button variant="secondary" href="/register">Get Started</Button>
          </div>
        </div>
      </section>

      <section className="p-8">
        <h2 className="text-2xl font-bold px-8 mb-4">Featured Recipes</h2>
        <div className="px-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {getDailyRecipes(recipes, 3).map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="flex bg-orange-500 p-8 h-48">
        <div className="w-full flex justify-end px-8">
          <h2 className="text-2xl font-bold text-right">How it works</h2>
        </div>
      </section>

      <section className="p-8 h-48">
        <div className="px-8">
          <h2 className="text-2xl font-bold">Key Features</h2>
        </div>
      </section>

      <section className="bg-orange-500 p-8 h-48">
        <div>
          <h2 className="text-2xl font-bold">Who we are</h2>
        </div>
      </section>

      <section className="p-8 h-48">
        <div className="px-8">
          <h2 className="text-2xl font-bold">Ready to share your recipes?</h2>
        </div>
      </section>
    </div>
  );
}
