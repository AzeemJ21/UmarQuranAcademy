import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Homework, HomeworkSchema } from './homework.schema';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Homework.name, schema: HomeworkSchema }])],
  providers: [HomeworkService],
  controllers: [HomeworkController],
})
export class HomeworkModule {}
