import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Server } from 'socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalGuards();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Website for MC')
    .setDescription('The Website for MC API description')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Create a Socket.IO server instance
  const io = new Server(app.getHttpServer());

  // Set the maximum number of listeners for the 'connection' event
  io.setMaxListeners(20);

  await app.listen(5000);
  Logger.log(`Application listening on port 5000`);
}
bootstrap();
