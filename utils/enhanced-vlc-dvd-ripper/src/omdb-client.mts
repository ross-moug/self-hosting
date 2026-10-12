import "reflect-metadata";
import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";
import { HttpMethod } from "./api.mts";

interface OmdbResponse {
  Runtime: string;
}

@injectable()
export class OmdbClient {
  private readonly omdbBaseUrl: string = "http:///www.omdbapi.com";
  private readonly secondsMultiplier: number = 60;

  constructor(@inject(InjectionToken.OmdbApiKey) private readonly omdbApiKey: string) {}

  async getFilmMetadata(name: string): Promise<number> {
    try {
      const response: Response = await fetch(`${this.omdbBaseUrl}/?apikey=${this.omdbApiKey}&t=${name}`, {
        method: HttpMethod.Get,
      });

      const body: OmdbResponse = await response.json();

      const runTime = Number(body.Runtime?.trim()?.slice(0, body.Runtime?.indexOf(" ")));

      return this.convertToSeconds(runTime);
    } catch (err) {
      console.error("An error occurred during film data retrieval: error: ", err);
      return NaN;
    }
  }
  private convertToSeconds(minutes: number): number {
    return minutes * this.secondsMultiplier;
  }
}
