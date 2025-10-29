import { Injectable } from '@nestjs/common';
import { CloudinaryProvider } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
    constructor(private readonly cloudinaryProvider: CloudinaryProvider) { }

    async deleteByUrl(url: string): Promise<void> {
        try {
            const parts = url.split('/upload/');
            if (!parts[1]) return;

            const publicIdWithVersion = parts[1];
            const publicIdWithoutVersion = publicIdWithVersion.replace(/^v\d+\//, '');
            const publicId = publicIdWithoutVersion.replace(/\.[^/.]+$/, '');

            const isVideo = url.includes('/video/');
            const resourceType = isVideo ? 'video' : 'image';

            await this.cloudinaryProvider.cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
            });

        } catch (err) {
            console.error('Cloudinary delete error:', err.message);
        }
    }

    async uploadImages(files: Express.Multer.File[], folder: string): Promise<string[]> {
        if (!files || files.length === 0) return [];

        return await Promise.all(
            files.map(async (file) => {
                const result = await this.cloudinaryProvider.cloudinary.uploader.upload(file.path, {
                    folder,
                    resource_type: 'image',
                });
                return result.secure_url;
            }),
        );
    }

    async uploadVideos(files: Express.Multer.File[], folder: string): Promise<string[]> {
        if (!files || files.length === 0) return [];

        return await Promise.all(
            files.map(async (file) => {
                const result = await this.cloudinaryProvider.cloudinary.uploader.upload(file.path, {
                    folder,
                    resource_type: 'video',
                });
                return result.secure_url;
            }),
        );
    }
}