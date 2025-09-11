import { Injectable } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
    constructor(private readonly cloudinaryProvider: CloudinaryProvider) { }

    async deleteImageByUrl(url: string): Promise<void> {
        try {
            const parts = url.split('/upload/');
            if (!parts[1]) return;

            const publicIdWithVersion = parts[1];
            const publicIdWithoutVersion = publicIdWithVersion.replace(/^v\d+\//, '');
            const publicId = publicIdWithoutVersion.replace(/\.[^/.]+$/, '');

            await this.cloudinaryProvider.cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }

    async uploadImages(files: Express.Multer.File[], folder: string): Promise<string[]> {
        if (!files || files.length === 0) return [];

        return await Promise.all(
            files.map(
                (file) =>
                    new Promise<string>((resolve, reject) => {
                        const stream = this.cloudinaryProvider.cloudinary.uploader.upload_stream(
                            { folder, resource_type: 'image' },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result!.secure_url);
                            },
                        );
                        stream.end(file.buffer);
                    }),
            ),
        );
    }

    async uploadVideos(files: Express.Multer.File[], folder: string): Promise<string[]> {
        if (!files || files.length === 0) return [];

        return await Promise.all(
            files.map(
                (file) =>
                    new Promise<string>((resolve, reject) => {
                        const stream = this.cloudinaryProvider.cloudinary.uploader.upload_stream(
                            { folder, resource_type: 'video' },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve(result!.secure_url);
                            },
                        );
                        stream.end(file.buffer);
                    }),
            ),
        );
    }
}