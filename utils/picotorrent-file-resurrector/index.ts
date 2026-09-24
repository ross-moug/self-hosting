import sqlite3 from "sqlite3"
import { type Database, open } from "sqlite";
import path from "node:path";
import { writeFileSync } from "node:fs";

interface TorrentMetadata {
  info_hash?: string;
  resume_data?: string;
}

const DB_FILE_PATH: string = "C:\\Users\\rossm\\AppData\\Local\\PicoTorrent\\PicoTorrent.sqlite";
const BASE_OUTPUT_DIR_PATH: string = "B:\\Downloads"

/**
 * Extract torrent data from the PicoTorrent DB and store as fresh `.torrent` files.
 *
 * Main motivation for this util was due to PicoTorrent hanging on torrent download, [this issue](https://github.com/picotorrent/picotorrent/issues/1249#issuecomment-2712050237)
 * advised recreating the torrent files with the data already downloaded for use in a different torrent client. In this
 * case there was no existing `.torrent` files as they were added via magnet links.
 *
 * @see [PicoTorrent GitHub issue](https://github.com/picotorrent/picotorrent/issues/1249#issuecomment-2712050237)
 * @see [`node-sqlite` docs](https://github.com/thelocalbranch/node-sqlite#usage)
 * @see [node file API docs](https://nodejs.org/api/fs.html)
 */
export class PicotorrentFileResurrector {
  async extract(dbFilePath: string, baseOutputDir: string): Promise<void> {
    console.log(`Starting torrent file extraction using DB at "${dbFilePath}".`);
    let db: Database | null = null;
    try {
      db = await open({
        driver: sqlite3.Database,
        filename: dbFilePath,
        mode: sqlite3.OPEN_READONLY,
      });

      await db.each<TorrentMetadata>("select info_hash, resume_data from torrent_resume_data", (err, {info_hash: infoHash = "", resume_data: resumeData = ""}) => {
          if (!err) {
              const outputDir: string = baseOutputDir;
              const filePath: string = path.join(outputDir, `${infoHash}.torrent`);
              writeFileSync(filePath, resumeData);
              console.log(`Torrent file created in "${outputDir}" for torrent with info has "${infoHash}".`);
          } else {
              console.error("An error occurred during torrent data extraction: error: ", err);
          }
      });
    } catch (err) {
      console.error("An error occurred during torrent data extraction: error: ", err);
    } finally {
      await db?.close();
      console.log(`DB connection closed.`);
    }
  }
}

try {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Torrent data extraction timed out")), 30_000)
  );
  await Promise.race([new PicotorrentFileResurrector().extract(DB_FILE_PATH, BASE_OUTPUT_DIR_PATH), timeout]);
} catch (err) {
  console.error("An error occurred: ", err);
}
