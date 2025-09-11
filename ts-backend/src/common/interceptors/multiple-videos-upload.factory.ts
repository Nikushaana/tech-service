import { BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const MultipleVideosUpload = (field: string, maxCount = 1) =>
    FilesInterceptor(field, maxCount, {
        storage: diskStorage({}),
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('video/')) {
                return cb(new BadRequestException('ატვირთე მხოლოდ ვიდეო!'), false);
            }
            cb(null, true);
        },
    });