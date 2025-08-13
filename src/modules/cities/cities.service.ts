import { Injectable, BadRequestException } from '@nestjs/common';
import { ThirdPartyService } from 'src/services/third-party/third-party.service';
import { WikipediaService } from 'src/services/wikipedia/wikipedia.service';
import { CitiesResponseDto, CityDto } from './dto/get-cities-response.dto';
import { CountryNameMap, ECountryCode } from './enum/country-name.enum';

@Injectable()
export class CitiesService {
  private cache = new Map<
    string,
    { data: CitiesResponseDto; timestamp: number }
  >();
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly wikiService: WikipediaService,
    private readonly thirdPartyService: ThirdPartyService,
  ) {}

  async getCities(country: ECountryCode): Promise<CitiesResponseDto> {
    if (!country || !Object.values(ECountryCode).includes(country)) {
      throw new BadRequestException(
        `Invalid country. Must be one of: ${Object.values(ECountryCode).join(', ')}`,
      );
    }

    const cacheKey = country.toString();

    // Check Cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    // Fetch Data (your existing logic)
    const allValidCitiesMap = new Map();
    let currentPage = 1;

    while (true) {
      const pollutionData = await this.thirdPartyService.getPollutionData(
        country,
        currentPage,
        100,
      );
      if (!pollutionData.results || pollutionData.results.length === 0) break;

      for (const item of pollutionData.results) {
        try {
          const cityName = item.name
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
          const capitalizedCityName =
            cityName.charAt(0).toUpperCase() + cityName.slice(1);

          const exists = await this.thirdPartyService.cityExistsGoogle(
            capitalizedCityName,
            country,
          );
          if (!exists.isCity) continue;

          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const city: string =
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            exists.cityName[0].formatted_address.split(',')[0];
          const wikiCity = await this.wikiService.getCityDescription(city);

          const key = city.toLowerCase();
          if (!allValidCitiesMap.has(key)) {
            allValidCitiesMap.set(key, {
              name: city,
              country: CountryNameMap[country],
              pollution: item.pollution,
              description: wikiCity.description || '',
            });
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (currentPage >= pollutionData.total) break;
      currentPage++;
    }

    const allValidCities: CityDto[] = Array.from(
      allValidCitiesMap.values(),
    ) as CityDto[];

    const result: CitiesResponseDto = {
      page: currentPage - 1,
      limit: (currentPage - 1) * 100,
      total: allValidCities.length,
      cities: allValidCities.sort((a, b) => b.pollution - a.pollution),
    };

    // Save to cache
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }
}
