import "reflect-metadata";
import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";
import { ContentType, Header, HttpMethod } from "./api.mts";

export interface EpisodeMetadata {
  name?: string;
  runTime?: number;
}

@injectable()
export class TvdbClient {
  private readonly tvdbBaseUrl: string = "https://api4.thetvdb.com/v4";

  constructor(@inject(InjectionToken.TvdbApiKey) private readonly tvdbApiKey: string) {}

  async getEpisodeMetadata(seriesName: string, seasonNumber: number, episodeNumber: number): Promise<EpisodeMetadata> {
    try {
      const token: string = await this.getToken();

      const response: Response = await fetch(
        `${this.tvdbBaseUrl}/series/${await this.getSeriesId(seriesName, token)}/episodes/official?page=0&season=${seasonNumber}&episodeNumber=${episodeNumber}`,
        {
          headers: {
            [Header.Authorization]: `Bearer ${token}`,
          },
          method: HttpMethod.Get,
        },
      );
      const episode = (await response.json()).data.episodes[0];

      return { name: episode.name, runTime: episode.runtime * 60 };
    } catch (err) {
      console.error("An error occurred during TV series data retrieval: error: ", err);
      return {};
    }
  }

  private async getToken(): Promise<string> {
    const loginResponse: Response = await fetch(`${this.tvdbBaseUrl}/login`, {
      body: JSON.stringify({
        apikey: this.tvdbApiKey.trim(),
      }),
      headers: {
        [Header.ContentType]: ContentType.Json,
      },
      method: HttpMethod.Post,
    });
    return (await loginResponse.json()).data.token;
  }

  private async getSeriesId(seriesName: string, token: string): Promise<string> {
    const slugResponse: Response = await fetch(`${this.tvdbBaseUrl}/series/slug/${this.createSeriesSlug(seriesName)}`, {
      headers: {
        [Header.Authorization]: `Bearer ${token}`,
      },
      method: HttpMethod.Get,
    });
    return (await slugResponse.json()).data.id;
  }

  private createSeriesSlug(seriesName: string): string {
    return seriesName.toLowerCase().replaceAll(" ", "-");
  }
}
