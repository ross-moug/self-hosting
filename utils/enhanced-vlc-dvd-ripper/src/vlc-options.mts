import { RipType } from "./rip.mts";

export interface VlcOptions {
  season?: number | undefined;
  episodeNumber?: number | undefined;
  mediaTitle?: string | undefined;
  runTime?: number | undefined;
  title: number;
  type: RipType;
}
