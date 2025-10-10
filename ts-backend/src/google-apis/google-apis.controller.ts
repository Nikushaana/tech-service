import { Controller, Get, Query } from '@nestjs/common';
import { GoogleApisService } from './google-apis.service';
import { GetCitiesDto } from './dto/get-cities.dto';
import { GetStreetsDto } from './dto/get-streets.dto';

@Controller('google-api')
export class GoogleApisController {
    constructor(private readonly googleService: GoogleApisService) { }

    @Get('cities')
    async getCities(@Query() query: GetCitiesDto) {
        return this.googleService.getCities(query.city);
    }

    @Get('streets')
    async getStreets(@Query() query: GetStreetsDto) {
        return this.googleService.getStreets(query.city, query.street);
    }
}
