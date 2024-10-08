import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ErrorHandlerMiddleware } from './common/middleware/error-handler.middleware';
import * as fs from 'fs-extra';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new ErrorHandlerMiddleware().use);

  const corsOptions: CorsOptions = {
    origin: true, // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // If you need to include cookies
  };

  // Enable CORS with the specified options
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('School Management API')
    .setDescription('API for managing school data')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const source = path.join(__dirname,"..","..","src", 'domains', 'pdfTemplates','billAndReciept.html');
  const destination = path.join(__dirname, 'domains', 'pdfTemplates');
  console.log('Source:', source);
  console.log('Destination:', destination);
  
  try {
    await fs.copyFile(source, path.join(destination, 'billAndReciept.html'));
    console.log('File copied and pasted in directory successfully!');
  } catch (error) {
    console.error('Failed to copy assets:', error.message);
  }
  await app.listen(3000);
}
bootstrap();
