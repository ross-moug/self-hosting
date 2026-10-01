import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import { Vlc } from "./vlc.mts";

interface RippingOptions {
  season: number;
  startingEpisode: number;
  episodeCountPerDisc: number;
}

/**
 *
 */
@injectable()
export class EnhancedDvdRipper {
  constructor(@inject(Vlc) private readonly vlc: Vlc) {}

  rip(options: RippingOptions): void {
    try {
      console.log(`Ripping DVD for season ${options.season} starting at episode ${options.startingEpisode}.`);

      const startingEpisodePosition = Number(options.startingEpisode);
      const episodes: number[] = Array.from(
        new Array(Number(options.episodeCountPerDisc)),
        (_, index) => startingEpisodePosition + index,
      );

      for (const episodeNumber of episodes) {
        console.log(`Start rip of season ${options.season}, episode ${episodeNumber}.`);
        const index: number = episodes.indexOf(episodeNumber);

        this.vlc.execute({
          season: options.season,
          episodeNumber,
          title: index + 2,
        });

        console.log(`Ripping of season ${options.season}, episode ${episodeNumber} complete.`);
      }
    } catch (err) {
      console.error("An error occurred during torrent data extraction: error: ", err);
    }

    console.log(`DVD rip complete.`);
  }
}
