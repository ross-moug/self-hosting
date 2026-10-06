import { MediaMetadata } from "./rip.mts";

export interface FilmMetadata extends MediaMetadata {
  title: string;
  runTime: number;
}
