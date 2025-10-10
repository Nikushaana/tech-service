import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleApisService {
    private readonly apiKey: string;
    private readonly autocompleteUrl: string;
    private readonly placeDetailsUrl: string;

    constructor() {
        if (!process.env.GOOGLE_MAPS_API_KEY) {
            throw new InternalServerErrorException('GOOGLE_MAPS_API_KEY is not set');
        }
        if (!process.env.GOOGLE_MAPS_AUTOCOMPLETE_URL) {
            throw new InternalServerErrorException('GOOGLE_MAPS_AUTOCOMPLETE_URL is not set');
        }
        if (!process.env.GOOGLE_MAPS_PLACE_DETAILS_URL) {
            throw new InternalServerErrorException('GOOGLE_MAPS_PLACE_DETAILS_URL is not set');
        }

        this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
        this.autocompleteUrl = process.env.GOOGLE_MAPS_AUTOCOMPLETE_URL;
        this.placeDetailsUrl = process.env.GOOGLE_MAPS_PLACE_DETAILS_URL;
    }

    // 🔹 Get details (lat/lng) for a place
    private async getPlaceDetails(placeId: string) {
        const params = {
            place_id: placeId,
            key: this.apiKey,
            fields: 'geometry',
        };

        const response = await axios.get(
            this.placeDetailsUrl,
            { params },
        );

        const { result } = response.data;
        if (!result?.geometry?.location) return null;

        return {
            location: result.geometry.location
        };
    }

    // 🔹 Autocomplete city names
    async getCities(city: string) {
        const params = {
            input: city,
            types: '(cities)',
            components: 'country:GE',
            key: this.apiKey,
        };

        const response = await axios.get(this.autocompleteUrl, { params });
        const predictions = response.data.predictions || [];

        // For each city, also fetch coordinates
        const results = await Promise.all(
            predictions.map(async (p: any) => {
                const details = await this.getPlaceDetails(p.place_id);
                return {
                    id: p.place_id,
                    name: p.description,
                    location: details?.location
                };
            }),
        );

        return results;
    }

    // 🔹 Get streets for a city
    async getStreets(city: string, street: string) {
        const params = {
            input: `${city} ${street}`,
            types: 'address',
            components: 'country:GE',
            key: this.apiKey,
        };

        const response = await axios.get(this.autocompleteUrl, { params });
        const predictions = response.data.predictions || [];

        // For each street, also fetch coordinates
        const results = await Promise.all(
            predictions.map(async (p: any) => {
                const details = await this.getPlaceDetails(p.place_id);
                return {
                    id: p.place_id,
                    name: p.description,
                    location: details?.location
                };
            }),
        );

        return results;
    }
}
