// src/stocks/stocks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { Stock } from './entities/stocks.entity';
import { YahooFinanceModule } from '../external-api/yahoo-finance/yahoo-finance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Stock]), YahooFinanceModule],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
