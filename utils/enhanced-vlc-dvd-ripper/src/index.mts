import "reflect-metadata";
import { config } from "dotenv";
import { container } from "tsyringe";

import { EnhancedDvdRipper } from "./enhanced-dvd-ripper.mts";
import { InjectionToken } from "./injection-token.enum.mts";

config();

container.registerSingleton(EnhancedDvdRipper);
container.register(InjectionToken.DiskDrive, { useValue: process.env.DISK_DRIVE });
container.register(InjectionToken.EpisodeCountPerDisc, { useValue: process.env.EPISODE_COUNT_PER_DISC });
container.register(InjectionToken.EpisodeOffset, { useValue: process.env.EPISODE_OFFSET });
container.register(InjectionToken.OutputDirectoryPath, {
  useValue: process.env.OUTPUT_DIRECTORY_PATH?.replaceAll("\\", "/"),
});
container.register(InjectionToken.Season, { useValue: process.env.SEASON });
container.register(InjectionToken.StartingEpisode, { useValue: process.env.STARTING_EPISODE });
container.register(InjectionToken.Title, { useValue: process.env.TITLE });
container.register(InjectionToken.TvdbApiKey, { useValue: process.env.TVDB_API_KEY });
container.register(InjectionToken.VlcExecutablePath, { useValue: process.env.VLC_EXECUTABLE_PATH });

try {
  const enhancedDvdRipper: EnhancedDvdRipper = container.resolve(EnhancedDvdRipper);
  await enhancedDvdRipper.rip({
    discStartingEpisode: Number(container.resolve(InjectionToken.StartingEpisode)),
    episodeCountPerDisc: Number(container.resolve(InjectionToken.EpisodeCountPerDisc)),
    episodeOffset: Number(container.resolve(InjectionToken.EpisodeOffset)),
    season: Number(container.resolve(InjectionToken.Season)),
    title: container.resolve(InjectionToken.Title),
  });
} catch (err) {
  console.error("An error occurred: ", err);
}
