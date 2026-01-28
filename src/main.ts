import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Morgan HTTP request logger
  app.use(morgan('dev'));

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.enableCors();
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Garment Inventory API')
    .setDescription('API documentation for Garment Inventory Management System')
    .setVersion('1.0')
    // Item Management Group
    .addTag('Items', 'Item CRUD operations')
    .addTag('Models', 'Model direct CRUD operations')
    .addTag('SKUs', 'SKU direct CRUD operations')
    .addTag('Item Models', 'Model operations nested under Item')
    .addTag('Item SKUs', 'SKU operations nested under Item/Model')
    .addTag('Item UOMs', 'UOM operations for Item')
    // Master Data Group
    .addTag('Item Categories', 'Item category management')
    .addTag('Item Types', 'Item type management')
    .addTag('Materials', 'Material management')
    .addTag('Colors', 'Color management')
    .addTag('Genders', 'Gender management')
    // .addTag('Sizes', 'Size management')
    .addTag('UOMs', 'Unit of Measure management')
    // Partners Group
    .addTag('Suppliers', 'Supplier management')
    .addTag('Customers', 'Customer management')
    // Auth
    .addTag('Auth', 'Authentication')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      filter: true, // Enable filter/search box
      showRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha', // Sort tags alphabetically
      operationsSorter: 'alpha', // Sort operations alphabetically
      docExpansion: 'none', // Collapse all by default
    },
  });

  const port = process.env.RUNNING_PORT || 3000;
  await app.listen(port, () => {
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(
      `API Documentation available at: http://localhost:${port}/api/docs`
    );
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
