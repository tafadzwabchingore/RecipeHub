"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

type Props = {
  recipeId: number;
  initialFavorited: boolean;
};

export function FavoriteButton({ recipeId, initialFavorited }: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggleFavorite() {
    if (loading) return;

    setLoading(true);
    const prev = favorited;
    setFavorited(!prev); 

    try {
      const res = await fetch("/api/favorites", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });

      if (!res.ok) throw new Error("Request failed");
    } catch {
      setFavorited(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFavorite}
      aria-pressed={favorited}
      disabled={loading}
    >
      <Heart className={`w-5 h-5 text-orange-500 hover:scale-150 transition duration-200 hover:font-bold ${favorited ? "fill-orange-500" : "fill-none"}`} />
    </button>
  );
}