import "reflect-metadata";
import { config } from "dotenv";
import {container} from "tsyringe";
import {PicotorrentFileResurrector} from "./picotorrent-file-resurrector.js";
import {InjectionToken} from "./injection-token.enun.js";

config();

container.registerSingleton(PicotorrentFileResurrector);
container.register(InjectionToken.DbFilePath, { useValue: process.env.DB_FILE_PATH });
container.register(InjectionToken.BaseOutputDirectoryPath, { useValue: process.env.BASE_OUTPUT_DIR_PATH });

try {
  const picotorrentFileResurrector: PicotorrentFileResurrector = container.resolve(PicotorrentFileResurrector);
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Torrent data extraction timed out")), 30_000)
  );
  await Promise.race([picotorrentFileResurrector.extract(), timeout]);
} catch (err) {
  console.error("An error occurred: ", err);
}
