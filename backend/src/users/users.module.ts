import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { JwtModule } from '@nestjs/jwt';           // Import JwtModule
import { RolesGuard } from '../auth/roles.guard';  // Import RolesGuard

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey', // apna JWT secret yahan rakhain
      signOptions: { expiresIn: '1d' },                  // token expiration
    }),
  ],
  providers: [UsersService, RolesGuard],  // RolesGuard yahan add karo
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
