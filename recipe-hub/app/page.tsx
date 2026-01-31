import Button from "@/components/Button";

export default function HomePage() {
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
        {/* TODO: Fetch and display recent recipes */}
        <p>Coming soon...</p>
      </section>
    </div>
  );
}