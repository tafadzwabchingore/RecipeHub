import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { recipeId, source, externalId, rating } = (await req.json()) as {
      recipeId?: number;
      source?: string;
      externalId?: number;
      rating?: number;
    };

    if ((!recipeId && !externalId) || !rating) {
      return NextResponse.json({ error: "recipeId/externalId and rating required" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = recipeId
      ? { user_id: user.id, recipe_id: recipeId, source: "community", rating }
      : { user_id: user.id, source: source ?? "spoonacular", external_id: externalId, rating };

    const { data, error } = await supabase
      .from("ratings")
      .upsert(payload, {
        onConflict: recipeId ? "user_id,recipe_id" : "user_id,source,external_id",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ rating: data?.rating ?? rating }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { recipeId, source, externalId } = (await req.json()) as {
      recipeId?: number;
      source?: string;
      externalId?: number;
    };

    if (!recipeId && !externalId) {
      return NextResponse.json({ error: "recipeId or externalId required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let deleteQuery = supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id);

    if (recipeId) {
      deleteQuery = deleteQuery.eq("recipe_id", recipeId);
    } else {
      deleteQuery = deleteQuery.eq("source", source ?? "spoonacular").eq("external_id", externalId);
    }

    const { error } = await deleteQuery;

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ rating: null }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
