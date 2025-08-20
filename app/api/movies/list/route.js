import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase.from("watched").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(req) {
  const movie = await req.json();

  const { error } = await supabase.from("watched").insert([movie]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Movie added to watched list" },
    { status: 201 }
  );
}
