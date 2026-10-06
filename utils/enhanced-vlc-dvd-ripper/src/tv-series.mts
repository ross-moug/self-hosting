import { MediaMetadata } from "./rip.mts";

export interface Episode {
  episodeNumber: number;
  title?: string | undefined;
  runTime?: number | undefined;
}

export interface TvSeriesMetadata extends MediaMetadata {
  title: string;
  season: {
    id: number;
    episodes: Episode[];
  };
}
