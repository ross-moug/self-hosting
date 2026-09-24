import "reflect-metadata";

import sqlite3 from "sqlite3"
import { type Database, open } from "sqlite";
import path from "node:path";
import { writeFileSync } from "node:fs";
import {inject, injectable} from "tsyringe";
import {InjectionToken} from "./injection-token.enun.js";

interface TorrentMetadata {
  info_hash?: string;
  resume_data?: string;
}

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
@injectable()
export class PicotorrentFileResurrector {
  constructor(
    @inject(InjectionToken.BaseOutputDirectoryPath) private readonly baseOutputDirPath: string,
    @inject(InjectionToken.DbFilePath) private readonly dbFilePath: string
  ) {
    console.log("baseOutputDirPath: ", this.baseOutputDirPath);
    console.log("dbFilePath: ", this.dbFilePath);
  }

  async extract(): Promise<void> {
    console.log(`Starting torrent file extraction using DB at "${this.dbFilePath}".`);
    let db: Database | null = null;
    try {
      db = await open({
        driver: sqlite3.Database,
        filename: this.dbFilePath,
        mode: sqlite3.OPEN_READONLY,
      });

      await db.each<TorrentMetadata>("select info_hash, resume_data from torrent_resume_data", (err, {info_hash: infoHash = "", resume_data: resumeData = ""}) => {
        if (!err) {
          const outputDir: string = this.baseOutputDirPath;
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