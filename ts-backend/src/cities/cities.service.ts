import { Injectable } from '@nestjs/common';
import { GooglePlacesService } from 'src/common/services/google-places/google-places.service';

@Injectable()
export class CitiesService {
  constructor(private readonly googlePlaces: GooglePlacesService) { }

  async getCities(city: string) {
    // Call the shared autocomplete method
    const predictions = await this.googlePlaces.autocomplete({
      input: city,
      types: '(cities)',
      components: 'country:GE',
    });

    // Fetch coordinates for each city
    const results = await Promise.all(
      predictions.map(async (p: any) => {
        const details = await this.googlePlaces.getPlaceDetails(p.place_id);
        return {
          id: p.place_id,
          name: p.description,
          location: details?.location,
        };
      }),
    );

    return results;
  }
}
