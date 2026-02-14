import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { recipeId, content } = (await req.json()) as {
      recipeId?: number;
      content?: string;
    };

    if (!recipeId || !content?.trim()) {
      return NextResponse.json({ error: "recipeId and content required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({ user_id: user.id, recipe_id: recipeId, content: content.trim() })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: { ...data, user_email: user.email } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { commentId, content } = (await req.json()) as {
      commentId?: number;
      content?: string;
    };

    if (!commentId || !content?.trim()) {
      return NextResponse.json({ error: "commentId and content required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("comments")
      .update({ content: content.trim(), updated_at: new Date().toISOString() })
      .eq("id", commentId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment: { ...data, user_email: user.email } }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { commentId } = (await req.json()) as { commentId?: number };

    if (!commentId) {
      return NextResponse.json({ error: "commentId required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error.details, hint: error.hint, code: error.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
