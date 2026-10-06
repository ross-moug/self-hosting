export interface RippingOptions {
  discStartingEpisode?: number;
  episodeCountPerDisc?: number;
  episodeCountToRip?: number;
  episodeOffset?: number;
  season?: number;
  title: string;
}

export const enum RipType {
  Film = "FILM",
  Tv = "TV",
}

export const enum PhysicalDriveType {
  CdDvd = "CD/DVD",
}

export interface MediaMetadata {
  title: string;
}
