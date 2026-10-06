import "reflect-metadata";

import { platform } from "node:os";
import { blockDevices } from "systeminformation";
import { injectable } from "tsyringe";

import { PhysicalDriveType, RippingOptions } from "./rip.mts";
import { Strategy } from "./strategy.mts";

/**
 * TODO
 * - Film support
 * - Tests
 */
@injectable()
export class EnhancedDvdRipper {
  async rip(options: RippingOptions, strategy: Strategy): Promise<void> {
    if (platform() !== "win32") {
      throw new Error("Unsupported OS! Only Windows is supported");
    } else if (!(await this.hasDisc())) {
      throw new Error("No DVD present!");
    }

    try {
      await strategy.rip(options);
    } catch (err) {
      console.error("An error occurred during DVD ripping: error: ", err);
    }
  }

  private async hasDisc(): Promise<boolean> {
    return (await blockDevices()).some(({ physical, label }) => physical === PhysicalDriveType.CdDvd && label);
  }
}
