import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configManager } from '@atlas/config';
import { StorageFactory, LocalDiskStorageProvider } from '@atlas/storage';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

// Load .env file explicitly before bootstrapping
dotenv.config();

async function bootstrap() {
  // Initialize config manager from process.env
  Object.keys(process.env).forEach(key => {
    configManager.set(key, process.env[key]);
  });

  // Initialize global storage provider
  const storagePath = configManager.has('STORAGE_PATH') ? configManager.get<string>('STORAGE_PATH') : './storage';
  StorageFactory.initialize(new LocalDiskStorageProvider({ 
    baseDir: path.resolve(process.cwd(), storagePath),
    baseUrl: '/uploads'
  }));

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const allowedOrigins = [
    configManager.has('FRONTEND_URL') ? configManager.get<string>('FRONTEND_URL') : null,
    configManager.has('SAAS_URL') ? configManager.get<string>('SAAS_URL') : null,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : /^http:\/\/localhost:\d+$/,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('Atlas Enterprise API')
    .setDescription(
      'The core platform and plugin APIs for the Atlas Enterprise Application Framework',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Fallback to APP_PORT if PORT is not defined
  const port = configManager.has('PORT') 
    ? configManager.get<string | number>('PORT') 
    : configManager.has('APP_PORT') 
      ? configManager.get<string | number>('APP_PORT') 
      : 3000;
      
  await app.listen(port);
  console.log(`Atlas core platform running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();