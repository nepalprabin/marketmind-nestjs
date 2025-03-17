// src/external-api/yahoo-finance/yahoo-finance.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { YahooFinanceService } from './yahoo-finance.service';

@Module({
  imports: [HttpModule],
  providers: [YahooFinanceService],
  exports: [YahooFinanceService],
})
export class YahooFinanceModule {}
