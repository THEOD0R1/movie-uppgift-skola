import { IMovie } from "./IMovie";

export interface IPagedMovies {
  movies: IMovie[];
  totalPages: number;
}
