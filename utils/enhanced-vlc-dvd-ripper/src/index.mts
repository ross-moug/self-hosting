import "reflect-metadata";
import { config } from "dotenv";
import { container } from "tsyringe";

import { EnhancedDvdRipper } from "./enhanced-dvd-ripper.mts";
import { InjectionToken } from "./injection-token.enum.mts";
import { FilmStrategy } from "./film-strategy.mts";

config();

container.registerSingleton(EnhancedDvdRipper);
container.register(InjectionToken.DiskDrive, { useValue: process.env.DISK_DRIVE });
container.register(InjectionToken.EpisodeCountPerDisc, { useValue: process.env.EPISODE_COUNT_PER_DISC });
container.register(InjectionToken.EpisodeCountToRip, { useValue: process.env.EPISODE_COUNT_TO_RIP });
container.register(InjectionToken.EpisodeOffset, { useValue: process.env.EPISODE_OFFSET });
container.register(InjectionToken.OmdbApiKey, { useValue: process.env.OMDB_API_KEY });
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
  const episodeCountPerDisc = Number(container.resolve(InjectionToken.EpisodeCountPerDisc));
  const episodeOffset = Number(container.resolve(InjectionToken.EpisodeOffset));
  await enhancedDvdRipper.rip(
    {
      discStartingEpisode: Number(container.resolve(InjectionToken.StartingEpisode)),
      episodeCountPerDisc: episodeCountPerDisc,
      episodeCountToRip:
        Number(container.resolve(InjectionToken.EpisodeCountToRip)) || episodeCountPerDisc - episodeOffset,
      episodeOffset: episodeOffset,
      season: Number(container.resolve(InjectionToken.Season)),
      title: container.resolve(InjectionToken.Title),
    },
    // TODO set dynamically
    container.resolve(FilmStrategy),
  );
} catch (err) {
  console.error("An error occurred: ", err);
}
