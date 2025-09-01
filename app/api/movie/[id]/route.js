export async function GET(request, context) {
  const apiKey = process.env.OMDB_API_KEY;
  const { id } = await context.params;

  try {
    const res = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${id}`);
    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch movie details" }),
        {
          status: 500,
        }
      );
    }

    const data = await res.json();

    if (data.Response === "False") {
      return new Response(JSON.stringify({ error: data.Error }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
