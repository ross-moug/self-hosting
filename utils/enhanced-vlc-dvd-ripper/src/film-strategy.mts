import "reflect-metadata";

import notifier from "node-notifier";
import { inject, injectable } from "tsyringe";

import { DiscDrive } from "./disc-drive.mts";
import { FilmMetadata } from "./film.mts";
import { OmdbClient } from "./omdb-client.mts";
import { RippingOptions, RipType } from "./rip.mts";
import { Strategy } from "./strategy.mts";
import { Vlc } from "./vlc.mts";

/**
 * TODO Tests
 */
@injectable()
export class FilmStrategy implements Strategy {
  constructor(
    @inject(Vlc) private readonly vlc: Vlc,
    @inject(DiscDrive) private readonly discDrive: DiscDrive,
    @inject(OmdbClient) private readonly omdbClient: OmdbClient,
  ) {}

  async rip(options: RippingOptions): Promise<void> {
    try {
      console.log("Ripping DVD.");

      const metadata: FilmMetadata = await this.getMetadata(options);

      console.log("metadata: ", metadata);
      // this.vlc.execute({
      //   mediaTitle: metadata.title,
      //   runTime: metadata.runTime,
      //   title: 1,
      //   type: RipType.Film,
      // });

      // await this.discDrive.eject();

      console.log(`DVD rip complete.`);
      notifier.notify({
        title: "Rip complete",
        message: `${options.title} complete.`,
        icon: "./assets/dvd.png",
        appID: "Enhanced DVD Ripper",
      });
    } catch (err) {
      console.error("An error occurred during DVD ripping: error: ", err);
    }
  }

  private async getMetadata(options: RippingOptions): Promise<FilmMetadata> {
    return {
      title: options.title,
      runTime: await this.omdbClient.getFilmMetadata(options.title),
    };
  }
}
