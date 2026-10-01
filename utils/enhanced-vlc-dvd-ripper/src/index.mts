import "reflect-metadata";
import { config } from "dotenv";
import { container } from "tsyringe";

import { EnhancedDvdRipper } from "./enhanced-dvd-ripper.mts";
import { InjectionToken } from "./injection-token.enum.mts";

config();

container.registerSingleton(EnhancedDvdRipper);
container.register(InjectionToken.Season, { useValue: process.env.SEASON });
container.register(InjectionToken.StartingEpisode, { useValue: process.env.STARTING_EPISODE });
container.register(InjectionToken.EpisodeCountPerDisc, { useValue: process.env.EPISODE_COUNT_PER_DISC });
container.register(InjectionToken.VlcExecutablePath, { useValue: process.env.VLC_EXECUTABLE_PATH });
container.register(InjectionToken.OutputDirectoryPath, {
  useValue: process.env.OUTPUT_DIRECTORY_PATH?.replaceAll("\\", "/"),
});

try {
  const enhancedDvdRipper: EnhancedDvdRipper = container.resolve(EnhancedDvdRipper);
  enhancedDvdRipper.rip({
    season: container.resolve(InjectionToken.Season),
    startingEpisode: container.resolve(InjectionToken.StartingEpisode),
    episodeCountPerDisc: container.resolve(InjectionToken.EpisodeCountPerDisc),
  });
} catch (err) {
  console.error("An error occurred: ", err);
}
