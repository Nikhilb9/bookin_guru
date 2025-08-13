import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WikipediaService {
  private readonly BASE_URL =
    'https://en.wikipedia.org/api/rest_v1/page/summary';

  constructor(private readonly http: HttpService) {}

  public async getCityDescription(
    city: string,
  ): Promise<{ description: string; cityName: string }> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/${encodeURIComponent(city)}`),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      return { description: data.extract, cityName: data.title };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.response?.status === 404) {
        throw new HttpException(
          `No Wikipedia page found for ${city}`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch city description',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
