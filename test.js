import app from "./app";
import request from "supertest";
import MovieService, { Movie } from "src/controller/movieController.ts";

const movieService = new MovieService();

beforeEach(() => {
  movieService.addMovie({ title: "Inception", director: "Christopher Nolan", year: 2010 });
  movieService.addMovie({ title: "The Dark Knight", director: "Christopher Nolan", year: 2008 });
  movieService.addMovie({ title: "The Godfather", director: "Francis Ford Coppola", year: 1972 });
});

describe("GET /movies", () => {
  it("should return all movies", async () => {
    const response = await request(app).get("/movies");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(movieService.getAllMovies());
  });
});

describe("GET /movies/:title", () => {
  it("should return a movie by title", async () => {
    const title = "Inception";
    const response = await request(app).get(`/movies/${title}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(movieService.getMovieByTitle(title));
  });

  it("should return 404 if movie is not found", async () => {
    const title = "Non-existent Movie";
    const response = await request(app).get(`/movies/${title}`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: `Movie with title ${title} not found` });
  });
});

describe("GET /movies/director/:director", () => {
  it("should return all movies by director", async () => {
    const director = "Christopher Nolan";
    const response = await request(app).get(`/movies/director/${director}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(movieService.getMoviesByDirector(director));
  });

  it("should return an empty array if director has no movies", async () => {
    const director = "Non-existent Director";
    const response = await request(app).get(`/movies/director/${director}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});

describe("POST /movies", () => {
  it("should add a new movie", async () => {
    const newMovie = { title: "The Shawshank Redemption", director: "Frank Darabont", year: 1994 };
    const response = await request(app).post("/movies").send(newMovie);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(newMovie);
    expect(movieService.getMovieByTitle(newMovie.title)).toEqual(newMovie);
  });

  it("should return 400 if request body is invalid", async () => {
    const invalidMovie = { title: "Invalid Movie" };
    const response = await request(app).post("/movies").send(invalidMovie);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Invalid request body" });
  });
});

