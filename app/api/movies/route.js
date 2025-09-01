import { NextResponse } from "next/server";

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { Response: "False", Error: "Missing query" },
      { status: 400 }
    );
  }

  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${query}`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
