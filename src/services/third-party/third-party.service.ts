/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ECountryCode } from 'src/modules/cities/enum/country-name.enum';
import { ConfigService } from '@nestjs/config';

export interface AuthResponse {
  token: string;
  expiresIn: number;
  refreshToken: string;
}

export interface PollutionRecord {
  name: string;
  country: string;
  pollution: number;
  date: string;
}

export interface PollutionResponse {
  results: PollutionRecord[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ThirdPartyService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private readonly BASE_URL: string =
    'https://be-recruitment-task.onrender.com';
  private readonly GOOGLE_API_URL =
    '   https://maps.googleapis.com/maps/api/geocode/json';
  private readonly USERNAME: string;
  private readonly PASSWORD: string;

  private readonly GOOGLE_API_KEY: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.USERNAME = this.configService.get<string>('API_USER') || 'testuser';
    this.PASSWORD = this.configService.get<string>('API_PASS') || 'testpass';
    this.GOOGLE_API_KEY =
      this.configService.get<string>('GOOGLE_API_KEY') || '';
  }

  private async login(): Promise<void> {
    try {
      const response: AxiosResponse<AuthResponse> = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.BASE_URL}/auth/login`, {
          username: this.USERNAME,
          password: this.PASSWORD,
        }),
      );
      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
    } catch {
      throw new HttpException('Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      await this.login();
      return;
    }
    try {
      const { data }: { data: AuthResponse } = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.BASE_URL}/auth/refresh`, {
          refreshToken: this.refreshToken,
        }),
      );

      this.token = data.token;
    } catch {
      await this.login();
    }
  }

  public async getPollutionData(
    country: ECountryCode,
    page: number,
    limit: number,
  ): Promise<PollutionResponse> {
    if (!this.token) {
      await this.login();
    }

    try {
      const { data }: { data: PollutionResponse } = await firstValueFrom(
        this.http.get<PollutionResponse>(`${this.BASE_URL}/pollution`, {
          headers: { Authorization: `Bearer ${this.token}` },
          params: { country, page, limit },
        }),
      );
      return data;
    } catch (err: any) {
      if (err.response?.data?.error === 'Token expired') {
        await this.refreshAccessToken();
        return this.getPollutionData(country, page, limit);
      }
      throw new HttpException(
        'Failed to fetch pollution data',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  public async cityExistsGoogle(
    cityName: string,
    countryCode?: string,
  ): Promise<{ isCity: boolean; cityName: any }> {
    const query = countryCode ? `${cityName}, ${countryCode}` : cityName;

    const url = `${this.GOOGLE_API_URL}?address=${encodeURIComponent(query)}&key=${this.GOOGLE_API_KEY}`;

    try {
      const { data } = await await firstValueFrom(this.http.get(url));

      if (data.status !== 'OK' || data.results.length === 0) {
        return { isCity: false, cityName: {} };
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const isCity = data.results.some(
        (r: any) =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          r.types.includes('locality') ||
          r.types.includes('administrative_area_level_2'),
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment
      return { isCity: isCity, cityName: data.results };
    } catch (err) {
      console.error('Google API error:', err);
      return { isCity: false, cityName: {} };
    }
  }
}
