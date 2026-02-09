import { Recipe } from "@/types/recipe"

export function getDailyRecipes(recipes: Recipe[], count = 3): Recipe[] {
    const today = new Date().toISOString().slice(0, 10);
    const seed = hashCode(today);

    // Seeded shuffle
    const shuffled = [...recipes].sort((a, b) => {
        return hashCode(`${seed}-${a.id}`) - hashCode(`${seed}-${b.id}`);
    });

    return shuffled.slice(0, count);
}

// simple string hash
function hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}