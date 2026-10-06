import "reflect-metadata";

import { platform } from "node:os";
import notifier from "node-notifier";
import { blockDevices } from "systeminformation";
import { inject, injectable } from "tsyringe";

import { DiscDrive } from "./disc-drive.mts";
import { EpisodeMetadata, TvdbClient } from "./tvdb-client.mts";
import { Vlc } from "./vlc.mts";

interface RippingOptions {
  discStartingEpisode: number;
  episodeCountPerDisc: number;
  episodeOffset: number;
  season: number;
  title: string;
}

interface Episode {
  episodeNumber: number;
  title?: string | undefined;
  runTime?: number | undefined;
}

const enum PhysicalDriveType {
  CdDvd = "CD/DVD",
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
    if (platform() !== "win32") {
      throw new Error("Unsupported OS! Only Windows is supported");
    } else if (!(await this.hasDisc())) {
      throw new Error("No DVD present!");
    }

    try {
      console.log(`Ripping DVD for season ${options.season} starting at episode ${options.discStartingEpisode}.`);

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
      console.error("An error occurred during DVD ripping: error: ", err);
    }
  }

  private async hasDisc(): Promise<boolean> {
    return (await blockDevices()).some(({ physical, label }) => physical === PhysicalDriveType.CdDvd && label);
  }

  private async getEpisodes(options: RippingOptions): Promise<Episode[]> {
    const startingEpisodePosition = Number(options.discStartingEpisode);
    return await Promise.all(
      Array.from(new Array(Number(options.episodeCountPerDisc - options.episodeOffset)), async (_, index) => {
        const episodeNumber: number = startingEpisodePosition + index + options.episodeOffset;
        const episodeMetadata: EpisodeMetadata = await this.tvdbClient.getEpisodeMetadata(
          options.title,
          options.season,
          startingEpisodePosition + index + options.episodeOffset,
        );

        return {
          episodeNumber,
          title: episodeMetadata.name,
          runTime: episodeMetadata.runTime,
        };
      }),
    );
  }
}
