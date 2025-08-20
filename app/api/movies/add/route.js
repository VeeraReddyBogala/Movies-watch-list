// app/api/movies/add/route.js

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const movie = await req.json();

    // ✅ Optional check for required fields
    if (!movie.imdbID || !movie.title) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.from("watched").insert([movie]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Movie added successfully", data },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error in POST /api/movies/add:", err.message);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }
}
