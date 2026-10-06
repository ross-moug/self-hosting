import "reflect-metadata";

import notifier from "node-notifier";
import { inject, injectable } from "tsyringe";

import { DiscDrive } from "./disc-drive.mts";
import { RippingOptions, RipType } from "./rip.mts";
import { Strategy } from "./strategy.mts";
import { EpisodeMetadata, TvdbClient } from "./tvdb-client.mts";
import { TvSeriesMetadata } from "./tv-series.mts";
import { Vlc } from "./vlc.mts";

/**
 * TODO Tests
 */
@injectable()
export class TvSeriesStrategy implements Strategy {
  constructor(
    @inject(Vlc) private readonly vlc: Vlc,
    @inject(DiscDrive) private readonly discDrive: DiscDrive,
    @inject(TvdbClient) private readonly tvdbClient: TvdbClient,
  ) {}

  async rip(options: RippingOptions): Promise<void> {
    try {
      console.log(
        `Ripping DVD for season ${options.season} starting at episode ${(options?.discStartingEpisode || 0) + (options?.episodeOffset || 0)}.`,
      );

      const metadata: TvSeriesMetadata = await this.getTvSeriesMetadata(options);

      for (const { episodeNumber, title: episodeTitle, runTime } of metadata.season.episodes) {
        console.log(`Start rip of season ${options.season}, episode ${episodeNumber}.`);
        const index: number = metadata.season.episodes.findIndex((episode) => episodeNumber == episode.episodeNumber);

        this.vlc.execute({
          season: options.season,
          episodeNumber,
          mediaTitle: episodeTitle,
          runTime,
          title: index + 1 + (options?.episodeOffset || 0),
          type: RipType.Tv,
        });

        console.log(`Ripping of season ${options.season}, episode ${episodeNumber} complete.`);
      }

      await this.discDrive.eject();

      console.log(`DVD rip complete.`);
      notifier.notify({
        title: "Rip complete",
        message: `${options.title} season ${options.season}, episodes ${metadata.season.episodes[0]}-${metadata.season.episodes[metadata.season.episodes.length - 1]} complete.`,
        icon: "./assets/dvd.png",
        appID: "Enhanced DVD Ripper",
      });
    } catch (err) {
      console.error("An error occurred during DVD ripping: error: ", err);
    }
  }

  private async getTvSeriesMetadata(options: RippingOptions): Promise<TvSeriesMetadata> {
    const startingEpisodePosition = Number(options.discStartingEpisode);
    return {
      title: options.title,
      season: {
        id: options.season || 0,
        episodes: await Promise.all(
          Array.from(new Array(Number(options.episodeCountToRip)), async (_, index) => {
            const episodeNumber: number = startingEpisodePosition + index + (options?.episodeOffset || 0);
            const episodeMetadata: EpisodeMetadata = await this.tvdbClient.getEpisodeMetadata(
              options.title,
              options?.season || 0,
              startingEpisodePosition + index + (options?.episodeOffset || 0),
            );

            return {
              episodeNumber,
              title: episodeMetadata.name,
              runTime: episodeMetadata.runTime,
            };
          }),
        ),
      },
    };
  }
}
