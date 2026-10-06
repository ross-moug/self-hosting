import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";
import type { VlcOptions } from "./vlc-options.mts";

@injectable()
export class VlcCommandFactory {
  private readonly episodeNumberLength: number = 2;
  private readonly episodePaddingCharacter: string = "0";
  private readonly runTimePaddingFactor: number = 0.1;
  private readonly fileExtension: string = ".mp4";

  constructor(
    @inject(InjectionToken.VlcExecutablePath) private readonly vlcExecutablePath: string,
    @inject(InjectionToken.OutputDirectoryPath) private readonly outputDirectoryPath: string,
  ) {}

  create(options: VlcOptions): string {
    return options?.runTime
      ? `"${this.vlcExecutablePath}" "dvdsimple:///F:/#${options.title}-1" --sout-all --run-time=${options.runTime + options.runTime * this.runTimePaddingFactor} --sout=#standard{access=file,mux=mp4,dst="${this.outputDirectoryPath}/${this.createFileName(options)}"} vlc://quit`
      : `"${this.vlcExecutablePath}" "dvdsimple:///F:/#${options.title}-1" --sout-all --sout=#standard{access=file,mux=mp4,dst="${this.outputDirectoryPath}/${this.createFileName(options)}"} vlc://quit`;
  }

  private createFileName(options: VlcOptions): string {
    const baseFileName = `(${options.season}x${this.createPaddedEpisodeNumber(options.episodeNumber)})`;
    return (
      options.episodeTitle ? `${baseFileName} - ${options.episodeTitle.replace(/'/g, "\\'")}` : `${baseFileName}`
    ).concat(this.fileExtension);
  }

  private createPaddedEpisodeNumber(episodeNumber: number): string {
    return String(episodeNumber).padStart(this.episodeNumberLength, this.episodePaddingCharacter);
  }
}
