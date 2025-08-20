"use client";
import { useEffect, useState } from "react";

export default function WatchedSummary({ watched }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) return null;

  const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{isNaN(avgImdbRating) ? "N/A" : avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{isNaN(avgUserRating) ? "N/A" : avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>
            {isNaN(avgRuntime) ? "N/A" : `${avgRuntime.toFixed(0)} min`}
          </span>
        </p>
      </div>
    </div>
  );
}
