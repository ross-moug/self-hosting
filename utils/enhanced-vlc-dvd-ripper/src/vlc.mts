import "reflect-metadata";

import { execSync } from "node:child_process";
import { inject, singleton } from "tsyringe";

import type { VlcOptions } from "./vlc-options.mts";
import { VlcCommandFactory } from "./vlc-command-factory.mts";

@singleton()
export class Vlc {
  constructor(@inject(VlcCommandFactory) private readonly vlcCommandFactory: VlcCommandFactory) {}

  execute(options: VlcOptions): void | never {
    this.validate(options);

    execSync(this.vlcCommandFactory.create(options), { stdio: "pipe" });
  }

  private validate(options: VlcOptions): void | never {
    Object.entries(options)
      .filter(([key]) => key !== "episodeTitle")
      .forEach(([key, value]) => this.validateNumberArgument(key as keyof VlcOptions, value));
  }

  private validateNumberArgument(key: keyof VlcOptions, value: number): void | never {
    if (isNaN(value) || value <= 0) {
      throw new Error(`Invalid argument: ${key} must be greater than zero.`);
    }
  }
}
