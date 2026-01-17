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
    // .addTag('items', 'Item management')
    // .addTag('item-categories', 'Item category management')
    // .addTag('item-types', 'Item type management')
    // .addTag('item-revisions', 'Item revision management')
    // .addTag('item-skus', 'Item SKU management')
    // .addTag('materials', 'Material management')
    // .addTag('colors', 'Color management')
    // .addTag('genders', 'Gender management')
    // .addTag('sizes', 'Size management')
    // .addTag('suppliers', 'Supplier management')
    // .addTag('supplier-item-packagings', 'Supplier item packaging management')
    // .addTag('customers', 'Customer management')
    // .addTag('customer-addresses', 'Customer address management')
    // .addTag('auth', 'Authentication')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

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
