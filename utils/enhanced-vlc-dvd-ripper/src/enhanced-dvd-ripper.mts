import "reflect-metadata";

import notifier from "node-notifier";
import { inject, injectable } from "tsyringe";

import { Vlc } from "./vlc.mts";
import { DiscDrive } from "./disc-drive.mts";

interface RippingOptions {
  episodeCountPerDisc: number;
  season: number;
  startingEpisode: number;
  title: string;
}

/**
 * TODO
 * - Film support
 * - Tests
 * - Pull episode from online DB
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

      console.log(`DVD rip complete.`);
      notifier.notify({
        title: "Rip complete",
        message: `${options.title} season ${options.season}, episodes ${episodes[0]}-${episodes[episodes.length - 1]} complete.`,
        icon: "./assets/dvd.png",
        appID: "Enhanced DVD Ripper",
      });
    } catch (err) {
      console.error("An error occurred during torrent data extraction: error: ", err);
    }
  }
}
