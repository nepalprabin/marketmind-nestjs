// src/earnings/earnings.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EarningsService } from './earnings.service';
import { EarningsController } from './earnings.controller';
import { EarningsEvent } from './entities/earnings-event.entity';
import { Stock } from '../stocks/entities/stocks.entity';
import { YahooFinanceModule } from '../external-api/yahoo-finance/yahoo-finance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EarningsEvent, Stock]),
    YahooFinanceModule,
  ],
  controllers: [EarningsController],
  providers: [EarningsService],
  exports: [EarningsService],
})
export class EarningsModule {}
