import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { JwtModule } from '@nestjs/jwt';           // Import JwtModule
import { RolesGuard } from '../auth/roles.guard';  // Import RolesGuard
import { MailModule } from 'src/mail/mail.module';
import { UserGateway } from './user.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey', 
      signOptions: { expiresIn: '1d' },                  
    }),
    MailModule,
  ],
  providers: [UsersService, RolesGuard ,UserGateway ],  
  controllers: [UsersController],
  exports: [UsersService,
    MongooseModule
  ],
})
export class UsersModule {}
