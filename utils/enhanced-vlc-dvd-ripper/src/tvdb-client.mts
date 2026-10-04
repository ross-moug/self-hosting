import "reflect-metadata";
import { inject, injectable } from "tsyringe";

import { InjectionToken } from "./injection-token.enum.mts";

@injectable()
export class TvdbClient {
  private readonly tvdbBaseUrl: string = "https://api4.thetvdb.com/v4";

  constructor(@inject(InjectionToken.TvdbApiKey) private readonly tvdbApiKey: string) {}

  async getEpisodeTitle(seriesName: string, seasonNumber: number, episodeNumber: number): Promise<string> {
    const token: string = await this.getToken();

    const response: Response = await fetch(
      `${this.tvdbBaseUrl}/series/${await this.getSeriesId(seriesName, token)}/episodes/official?page=0&season=${seasonNumber}&episodeNumber=${episodeNumber}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      },
    );
    return (await response.json()).data.episodes[0].name;
  }

  private async getToken(): Promise<string> {
    const loginResponse: Response = await fetch(`${this.tvdbBaseUrl}/login`, {
      body: JSON.stringify({
        apikey: this.tvdbApiKey.trim(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    return (await loginResponse.json()).data.token;
  }

  private async getSeriesId(seriesName: string, token: string): Promise<string> {
    const slugResponse: Response = await fetch(`${this.tvdbBaseUrl}/series/slug/${this.createSeriesSlug(seriesName)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "GET",
    });
    return (await slugResponse.json()).data.id;
  }

  private createSeriesSlug(seriesName: string): string {
    return seriesName.toLowerCase().replaceAll(" ", "-");
  }
}
