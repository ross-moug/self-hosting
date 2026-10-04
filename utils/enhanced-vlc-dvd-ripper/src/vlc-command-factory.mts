import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";
import type { VlcOptions } from "./vlc-options.mts";

@injectable()
export class VlcCommandFactory {
  private readonly episodeNumberLength: number = 2;
  private readonly episodePaddingCharacter: string = "0";

  constructor(
    @inject(InjectionToken.VlcExecutablePath) private readonly vlcExecutablePath: string,
    @inject(InjectionToken.OutputDirectoryPath) private readonly outputDirectoryPath: string,
  ) {}

  create(options: VlcOptions): string {
    return `"${this.vlcExecutablePath}" --one-instance --no-loop "dvdsimple:///F:/#${options.title}" --no-sout-all --audio-language=eng --sub-language=eng --avcodec-hw=none --play-and-exit --sout=#transcode{vcodec=h264,acodec=mp4a,ab=192,channels=2,soverlay}:standard{access=file,mux=mp4,dst="${this.outputDirectoryPath}/(${options.season}x${this.createPaddedEpisodeNumber(options.episodeNumber)}) - ${options.episodeTitle}.mp4"}`;
  }

  private createPaddedEpisodeNumber(episodeNumber: number): string {
    return String(episodeNumber).padStart(this.episodeNumberLength, this.episodePaddingCharacter);
  }
}
