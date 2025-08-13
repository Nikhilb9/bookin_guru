import { Controller, Get, Query } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesResponseDto } from './dto/get-cities-response.dto';
import { ECountryCode } from './enum/country-name.enum';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Get()
  async getCities(
    @Query('country') country: ECountryCode,
  ): Promise<CitiesResponseDto> {
    return this.citiesService.getCities(country);
  }
}
