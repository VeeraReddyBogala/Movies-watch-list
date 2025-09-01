import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const movieData = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be logged in to add a movie." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("watched")
    .insert({
      imdbID: movieData.imdbID,
      title: movieData.title,
      year: movieData.year,
      poster: movieData.poster,
      runtime: movieData.runtime,
      imdbRating: movieData.imdbRating,
      userRating: movieData.userRating,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding movie to Supabase:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
