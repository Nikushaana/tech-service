import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const MultipleImagesUpload = (field: string, maxCount = 2) =>
    FilesInterceptor(field, maxCount, {
        storage: diskStorage({}), // you can customize filename/destination if needed
        limits: { files: maxCount },
        fileFilter: (req, file, cb) => {
            // File type validation
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ სურათი!'), false);
            }
            cb(null, true);
        },
    });