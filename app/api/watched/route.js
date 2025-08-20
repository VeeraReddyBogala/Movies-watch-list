// app/api/watched/route.js

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all rows from the 'watched' table
    const { data, error } = await supabase.from("watched").select("*");

    if (error) {
      console.error("❌ Supabase fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the data
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("❌ Catch error in /watched GET:", err.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
