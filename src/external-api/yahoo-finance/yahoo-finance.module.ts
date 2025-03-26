// src/external-api/yahoo-finance/yahoo-finance.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YahooFinanceService } from './yahoo-finance.service';
import { YahooFinanceController } from './yahoo-finance.controller';

@Module({
  imports: [HttpModule],
  controllers: [YahooFinanceController],
  providers: [YahooFinanceService],
  exports: [YahooFinanceService],
})
export class YahooFinanceModule {}
