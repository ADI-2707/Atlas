import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  app.setGlobalPrefix('api/v1');


  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.SAAS_URL,
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


  const port = process.env.APP_PORT || 3000;
  await app.listen(port);
  console.log(`Atlas core platform running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation available at: http://localhost:${port}/docs`);
}

bootstrap();
// Reload to register crm endpoints
