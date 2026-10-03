import "reflect-metadata";

import nircmd from "nircmd";
import { inject, singleton } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";

@singleton()
export class DiscDrive {
  constructor(@inject(InjectionToken.DiskDrive) private readonly discDrive: string) {
    this.validate();
  }

  async eject(): Promise<void> {
    await nircmd(`nircmd.exe cdrom open ${this.discDrive}:`);
  }

  private validate(): void | never {
    if (!this.discDrive || this.discDrive == "") {
      throw new Error(`Invalid argument: disc drive must be set.`);
    }
  }
}
