import { useState, useEffect } from "react";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch(`/api/movies?q=${query}`, {
          signal: controller.signal,
        });

        if (!res.ok)
          throw new Error("Something went wrong with fetching movies");

        const data = await res.json();

        if (data.Response === "False") {
          setMovies([]);
          setError(data.Error);
          return;
        }

        setMovies(data.Search || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (!query || query.trim() === "") {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
    return () => controller.abort();
  }, [query]);

  return { movies, isLoading, error };
}
