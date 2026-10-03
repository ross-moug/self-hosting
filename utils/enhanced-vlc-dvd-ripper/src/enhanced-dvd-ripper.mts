import "reflect-metadata";

import { inject, injectable } from "tsyringe";

import { Vlc } from "./vlc.mts";
import { DiscDrive } from "./disc-drive.mts";

interface RippingOptions {
  season: number;
  startingEpisode: number;
  episodeCountPerDisc: number;
}

/**
 * TODO
 * - Film support
 * - Tests
 * - Pull episode from online DB
 * - Notification
 */
@injectable()
export class EnhancedDvdRipper {
  constructor(
    @inject(Vlc) private readonly vlc: Vlc,
    @inject(DiscDrive) private readonly discDrive: DiscDrive,
  ) {}

  async rip(options: RippingOptions): Promise<void> {
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

      await this.discDrive.eject();
    } catch (err) {
      console.error("An error occurred during torrent data extraction: error: ", err);
    }

    console.log(`DVD rip complete.`);
  }
}
