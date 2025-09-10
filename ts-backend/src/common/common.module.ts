import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryProvider } from './providers/cloudinary.provider';

@Module({
    imports: [ConfigModule],
    providers: [CloudinaryProvider],
    exports: [CloudinaryProvider],
})
export class CommonModule { }