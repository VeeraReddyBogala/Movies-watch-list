import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  const imdbID = params.id?.trim().toLowerCase();
  console.log(`🎬 Attempting to delete movie with imdbID: ${imdbID}`);

  const { data, error } = await supabase
    .from("watched")
    .delete()
    .eq("imdbID", imdbID)
    .select();

  if (error) {
    console.error("Supabase deletion error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("🔎 Supabase delete response:", data);

  if (!data || data.length === 0) {
    console.warn("No movie found with this imdbID in Supabase");
    return NextResponse.json(
      { message: `No movie found with imdbID ${imdbID}` },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { message: `Movie with imdbID ${imdbID} deleted`, deleted: data },
    { status: 200 }
  );
}
