import "reflect-metadata";
import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";
import { HttpMethod } from "./api.mts";

@injectable()
export class OmdbClient {
  private readonly omdbBaseUrl: string = "http:///www.omdbapi.com";

  constructor(@inject(InjectionToken.OmdbApiKey) private readonly omdbApiKey: string) {}

  async getFilmMetadata(name: string): Promise<number> {
    try {
      const response: Response = await fetch(`${this.omdbBaseUrl}/?apikey=${this.omdbApiKey}&s=${name}`, {
        method: HttpMethod.Get,
      });

      // TODO
      console.log("response: ", response);
      const runTime: number = (await response.json()).Runtime;

      return runTime * 60;
    } catch (err) {
      console.error("An error occurred during TV series data retrieval: error: ", err);
      return NaN;
    }
  }
}
