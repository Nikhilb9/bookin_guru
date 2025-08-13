import { ApiProperty } from '@nestjs/swagger';
import { ICitiesResponse, ICity } from '../interface/cities.interface';

export class CityDto implements ICity {
  @ApiProperty({ example: 'Delhi' })
  name: string;

  @ApiProperty({ example: 'India' })
  country: string;

  @ApiProperty({ example: 350 })
  pollution: number;

  @ApiProperty({ example: 'Delhi is the capital territory of India...' })
  description: string;
}

export class CitiesResponseDto implements ICitiesResponse {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 2 })
  limit: number;

  @ApiProperty({ example: 25 })
  total: number;

  @ApiProperty({ type: [CityDto], default: [] })
  cities: CityDto[];
}
