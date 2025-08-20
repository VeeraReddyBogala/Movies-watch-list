import { supabase } from "@/lib/supabase";

export async function POST(request) {
  try {
    const movie = await request.json();

    const { error } = await supabase.from("movies").insert([movie]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(
      JSON.stringify({ message: "Movie added successfully" }),
      {
        status: 200,
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
