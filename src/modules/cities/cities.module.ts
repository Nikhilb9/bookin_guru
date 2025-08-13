import { Module } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { ThirdPartyService } from 'src/services/third-party/third-party.service';
import { WikipediaService } from 'src/services/wikipedia/wikipedia.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [CitiesController],
  providers: [CitiesService, WikipediaService, ThirdPartyService],
})
export class CitiesModule {}
