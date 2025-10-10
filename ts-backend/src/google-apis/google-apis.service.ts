import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleApisService {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor() {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new InternalServerErrorException('GOOGLE_MAPS_API_KEY is not set');
        }
        if (!process.env.GOOGLE_MAPS_BASE_URL) {
            throw new InternalServerErrorException('GOOGLE_MAPS_BASE_URL is not set');
        }

        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.baseUrl = process.env.GOOGLE_MAPS_BASE_URL;
    }

    // Get cities based on input
    async getCities(city: string) {
        const params = {
            input: city,
            types: '(cities)',
            components: 'country:GE',
            key: this.apiKey,
        };

        const response = await axios.get(this.baseUrl, { params });
        return response.data.predictions.map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
        }));
    }

    // Get streets in a city
    async getStreets(city: string, street: string) {
        const params = {
            input: `${city} ${street}`,
            types: 'address',
            components: 'country:GE',
            key: this.apiKey,
        };

        const response = await axios.get(this.baseUrl, { params });
        return response.data.predictions.map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
        }));
    }
}
