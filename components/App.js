"use client";

import { useEffect, useRef, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import StarRating from "./StarRating";
import { useKey } from "./useKey";
import { useMovies } from "./useMovies";
import WatchedSummary from "@/components/WatchedSummary";
import AuthForm from "./AuthForm";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);
  const [watched, setWatched] = useState([]);

  //STATES FOR AUTHENTICATION
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  async function handleAddWatched(movie) {
    const isAlreadyWatched = watched.some(
      (watchedMovie) => watchedMovie.imdbID === movie.imdbID
    );

    if (isAlreadyWatched) {
      alert(`${movie.title} is already in your watched list!`);
      return;
    }
    try {
      const movieToAdd = { ...movie, imdbID: movie.imdbID.toLowerCase() };
      const response = await fetch("/api/movies/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movieToAdd),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setWatched((prev) => [...prev, movieToAdd]);
    } catch (err) {
      console.error("Error adding movie:", err.message);
    }
  }

  async function handleDeleteWatched(imdbID) {
    try {
      setWatched((watched) =>
        watched.filter((movie) => movie.imdbID !== imdbID.toLowerCase())
      );

      const res = await fetch(`/api/movies/delete/${imdbID.toLowerCase()}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete movie from database");
    } catch (err) {
      console.error("Delete error:", err.message);
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
  }

  function handleSelectMovie(id) {
    setSelectedId(id);
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  // runs only once at mount to fetch the current session + movies.
  useEffect(() => {
    async function getSessionAndMovies() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: watchedMovies, error } = await supabase
          .from("watched")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching watched movies:", error);
        } else {
          setWatched(watchedMovies || []);
        }
      }
      setLoading(false);
    }
    getSessionAndMovies();
  }, [supabase]);

  // login or logout

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setWatched([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      {!session ? (
        <div className="auth-container">
          <Logo />
          <AuthForm />
        </div>
      ) : (
        <>
          <NavBar user={session.user} onLogout={handleLogout}>
            <Search query={query} setQuery={setQuery} />
            <NumResults movies={movies} />
          </NavBar>
          <Main>
            <Box>
              {isLoading && <Loader />}
              {!isLoading && !error && (
                <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
              )}
              {error && <ErrorMessage message={error} />}
            </Box>
            <Box>
              {selectedId ? (
                <MovieDetails
                  selectedId={selectedId}
                  onCloseMovie={handleCloseMovie}
                  onAddWatched={handleAddWatched}
                  watched={watched}
                  user={session.user}
                />
              ) : (
                <>
                  <WatchedSummary watched={watched} />
                  <WatchedMoviesList
                    watched={watched}
                    onDeleteWatched={handleDeleteWatched}
                  />
                </>
              )}
            </Box>
          </Main>
        </>
      )}
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔️</span> {message}
    </p>
  );
}

function NavBar({ children, user, onLogout }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
      {user && (
        <div className="user-info">
          <p>Welcome, {user.email}</p>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>Movies Watch List</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement !== inputEl.current) {
      inputEl.current.focus();
    } else {
      setQuery("");
    }
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie, index) => (
        <Movie
          movie={movie}
          key={`${movie.imdbID}-${index}`}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovie,
  onAddWatched,
  watched,
  user,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const [comments, setComments] = useState([]);
  const [authors, setAuthors] = useState({});
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClientComponentClient();
  const countRef = useRef(0);

  const isWatched = watched
    .map((movie) => movie.imdbID.toLowerCase())
    .includes(selectedId.toLowerCase());
  const watchedUserRating = watched.find(
    (movie) => movie.imdbID.toLowerCase() === selectedId.toLowerCase()
  )?.userRating;

  const {
    Title: title = "",
    Year: year = "",
    Poster: poster = "",
    Runtime: runtime = "N/A",
    imdbRating = "N/A",
    Plot: plot = "",
    Released: released = "",
    Actors: actors = "",
    Director: director = "",
    Genre: genre = "",
  } = movie;

  function handleAdd() {
    const runtimeValue = Number(runtime.split(" ").at(0));
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: !isNaN(runtimeValue) ? runtimeValue : 0,
      userRating,
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movie_id: selectedId.toLowerCase(),
          content: newComment,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to post comment.");
      }
      setComments((currentComments) => [result, ...currentComments]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    setComments(comments.filter((comment) => comment.id !== commentId));
    await fetch(`/api/comments/delete/${commentId}`, {
      method: "DELETE",
    });
  }

  useKey("Escape", onCloseMovie);

  useEffect(() => {
    if (userRating) countRef.current++;
  }, [userRating]);

  useEffect(() => {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`/api/movie/${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    if (selectedId) getMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    async function fetchComments() {
      if (!selectedId) return;
      const { data, error } = await supabase
        .from("comments")
        .select("id, created_at, content, user_id")
        .eq("movie_id", selectedId.toLowerCase())
        .order("created_at", { ascending: false });

      if (error) console.error("Error fetching comments:", error);
      else setComments(data || []);
    }
    fetchComments();
  }, [selectedId, supabase]);

  useEffect(() => {
    async function fetchAuthors() {
      if (comments.length === 0) {
        setAuthors({});
        return;
      }
      const userIds = [...new Set(comments.map((comment) => comment.user_id))];

      const { data: authorsData, error } = await supabase.rpc(
        "get_emails_for_user_ids",
        { user_ids: userIds }
      );

      if (error) {
        console.error("Error fetching authors:", error);
      } else {
        const authorsMap = authorsData.reduce((acc, author) => {
          acc[author.id] = author.email;
          return acc;
        }, {});
        setAuthors(authorsMap);
      }
    }
    fetchAuthors();
  }, [comments, supabase]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => {
      document.title = "Movies WatchList";
    };
  }, [title]);

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            {poster && poster !== "N/A" && (
              <img src={poster} alt={`Poster of ${title} movie`} />
            )}
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie {watchedUserRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>

          <section className="comments-section">
            <h3>Comments ({comments.length})</h3>
            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your comment here..."
                disabled={isSubmitting}
              />
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment">
                    <div className="comment-header">
                      <p className="comment-author">
                        {authors[comment.user_id] || "..."}
                      </p>
                      {user && user.id === comment.user_id && (
                        <button
                          className="btn-delete-comment"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <p>{comment.content}</p>
                    <small>
                      Posted on{" "}
                      {new Date(comment.created_at).toLocaleDateString()}
                    </small>
                  </div>
                ))
              ) : (
                <p>No comments yet. Be the first to say something!</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>
            {typeof movie.imdbRating === "number" && !isNaN(movie.imdbRating)
              ? movie.imdbRating
              : "N/A"}
          </span>
        </p>
        <p>
          <span>🌟</span>
          <span>
            {typeof movie.userRating === "number" && !isNaN(movie.userRating)
              ? movie.userRating
              : "N/A"}
          </span>
        </p>
        <p>
          <span>⏳</span>
          <span>
            {typeof movie.runtime === "number" && !isNaN(movie.runtime)
              ? `${movie.runtime} min`
              : "N/A"}
          </span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}
