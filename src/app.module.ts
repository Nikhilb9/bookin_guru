import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitiesModule } from './modules/cities/cities.module';
import { ThirdPartyService } from './services/third-party/third-party.service';
import { WikipediaService } from './services/wikipedia/wikipedia.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    CitiesModule,
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
  ],
  controllers: [AppController],
  providers: [AppService, ThirdPartyService, WikipediaService],
})
export class AppModule {}
