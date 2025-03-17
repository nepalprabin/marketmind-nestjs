// src/database/seeders/seed.ts
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seederService = appContext.get(SeederService);

  try {
    await seederService.seed();
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed', error);
  } finally {
    await appContext.close();
  }
}

bootstrap();
