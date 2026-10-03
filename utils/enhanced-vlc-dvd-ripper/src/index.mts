import "reflect-metadata";
import { config } from "dotenv";
import { container } from "tsyringe";

import { EnhancedDvdRipper } from "./enhanced-dvd-ripper.mts";
import { InjectionToken } from "./injection-token.enum.mts";

config();

container.registerSingleton(EnhancedDvdRipper);
container.register(InjectionToken.DiskDrive, { useValue: process.env.DISK_DRIVE });
container.register(InjectionToken.EpisodeCountPerDisc, { useValue: process.env.EPISODE_COUNT_PER_DISC });
container.register(InjectionToken.OutputDirectoryPath, {
  useValue: process.env.OUTPUT_DIRECTORY_PATH?.replaceAll("\\", "/"),
});
container.register(InjectionToken.Season, { useValue: process.env.SEASON });
container.register(InjectionToken.StartingEpisode, { useValue: process.env.STARTING_EPISODE });
container.register(InjectionToken.Title, { useValue: process.env.TITLE });
container.register(InjectionToken.VlcExecutablePath, { useValue: process.env.VLC_EXECUTABLE_PATH });

try {
  const enhancedDvdRipper: EnhancedDvdRipper = container.resolve(EnhancedDvdRipper);
  await enhancedDvdRipper.rip({
    episodeCountPerDisc: container.resolve(InjectionToken.EpisodeCountPerDisc),
    season: container.resolve(InjectionToken.Season),
    startingEpisode: container.resolve(InjectionToken.StartingEpisode),
    title: container.resolve(InjectionToken.Title),
  });
} catch (err) {
  console.error("An error occurred: ", err);
}
