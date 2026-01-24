export default function HomePage() {
  return (
    <div className="flex-col gap-8 p-8">
      <section>
        <h1 className="font-bold text-4xl">Welcome to RecipeHub</h1>
        <p>Create, share, and discover recipes from home cooks everywhere.</p>
        <div className="mt-4 flex flex-row gap-4">
          <a href="/recipes" className="px-4 py-2 bg-blue-600 text-white rounded">Browse Recipes</a>
          <a href="/register" className="px-4 py-2 bg-gray-200 text-black rounded">Get Started</a>
        </div>
      </section>

      <section className="mt-16">
        <h2>Featured Recipes</h2>
        {/* TODO: Fetch and display recent recipes */}
        <p>Coming soon...</p>
        
      </section>
    </div>
  );
}