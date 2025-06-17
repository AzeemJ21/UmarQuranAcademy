import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: process.env.JWT_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.enableCors({
    origin: ['https://umarquranacademy.onrender.com', 'http://localhost:3000'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
