import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';
import { GooglePlacesService } from 'src/common/services/google-places/google-places.service';

@Module({
  controllers: [CitiesController],
  providers: [GooglePlacesService, CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
