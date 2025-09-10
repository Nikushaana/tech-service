import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudinaryProvider {
    public readonly cloudinary: typeof cloudinary;

    constructor(private configService: ConfigService) {
        this.cloudinary = cloudinary;
        this.cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
        });
    }
}