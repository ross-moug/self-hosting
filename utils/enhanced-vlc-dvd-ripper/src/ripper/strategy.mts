import { RippingOptions } from "./rip.mts";

export interface Strategy {
  rip(options: RippingOptions): Promise<void>;
}
