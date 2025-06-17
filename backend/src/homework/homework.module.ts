import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Homework, HomeworkSchema } from './homework.schema';
import { HomeworkService } from './homework.service';
import { HomeworkController } from './homework.controller';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';
import { User, UserSchema } from 'src/users/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Homework.name, schema: HomeworkSchema },
     { name: User.name, schema: UserSchema }, 
  ]),
MailModule,
UsersModule],
  providers: [HomeworkService,],
  controllers: [HomeworkController],
})
export class HomeworkModule {}
