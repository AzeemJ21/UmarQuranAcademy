import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirect to Google login
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const payload = { sub: user._id.toString(), role: user.role };
    const token = this.jwtService.sign(payload);

    // 🔁 Redirect to frontend dashboard with token & user ID in query params
    return res.redirect(
      `http://localhost:3000/dashboard/${user.role}?token=${token}&userId=${user._id}`
    );
  }

  @Post('register')
  async register(
    @Body() body: { name: string; email: string; password: string; role?: string },
  ) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await this.userService.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'student',
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
