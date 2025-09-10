import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const MultipleImagesUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: diskStorage({}),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ სურათი!'), false);
            }
            cb(null, true);
        },
    });