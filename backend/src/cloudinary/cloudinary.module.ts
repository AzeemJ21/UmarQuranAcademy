import { Module } from '@nestjs/common';
import { cloudinary } from './cloudinary.provider';

@Module({
  providers: [
    {
      provide: 'CLOUDINARY',
      useValue: cloudinary,
    },
  ],
  exports: ['CLOUDINARY'],
})
export class CloudinaryModule {}
