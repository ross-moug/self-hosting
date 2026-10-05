import "reflect-metadata";

import notifier from "node-notifier";
import { inject, injectable } from "tsyringe";

import { DiscDrive } from "./disc-drive.mts";
import { EpisodeMetadata, TvdbClient } from "./tvdb-client.mts";
import { Vlc } from "./vlc.mts";

interface RippingOptions {
  episodeCountPerDisc: number;
  season: number;
  startingEpisode: number;
  title: string;
}

interface Episode {
  episodeNumber: number;
  title: string;
  runTime: number;
}

/**
 * TODO
 * - Film support
 * - Tests
 */
@injectable()
export class EnhancedDvdRipper {
  constructor(
    @inject(Vlc) private readonly vlc: Vlc,
    @inject(DiscDrive) private readonly discDrive: DiscDrive,
    @inject(TvdbClient) private readonly tvdbClient: TvdbClient,
  ) {}

  async rip(options: RippingOptions): Promise<void> {
    try {
      console.log(`Ripping DVD for season ${options.season} starting at episode ${options.startingEpisode}.`);

      const episodes: Episode[] = await this.getEpisodes(options);

      for (const { episodeNumber, title: episodeTitle, runTime } of episodes) {
        console.log(`Start rip of season ${options.season}, episode ${episodeNumber}.`);
        const index: number = episodes.findIndex((episode) => episodeNumber == episode.episodeNumber);

        this.vlc.execute({
          season: options.season,
          episodeNumber,
          episodeTitle,
          runTime,
          title: index + 1,
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

  private async getEpisodes(options: RippingOptions): Promise<Episode[]> {
    const startingEpisodePosition = Number(options.startingEpisode);
    return await Promise.all(
      Array.from(new Array(Number(options.episodeCountPerDisc)), async (_, index) => {
        const episodeMetadata: EpisodeMetadata = await this.tvdbClient.getEpisodeMetadata(
          options.title,
          options.season,
          startingEpisodePosition + index,
        );
        return {
          episodeNumber: startingEpisodePosition + index,
          title: episodeMetadata.name,
          runTime: episodeMetadata.runTime,
        };
      }),
    );
  }
}
