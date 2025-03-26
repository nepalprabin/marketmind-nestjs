// src/yahoo-finance/yahoo-finance.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { YahooFinanceService } from './yahoo-finance.service';
import { Observable } from 'rxjs';

@Controller('')
export class YahooFinanceController {
  constructor(private readonly yahooFinanceService: YahooFinanceService) {}

  @Get('yahoo-finance/chart')
  getStockChart(
    @Query('symbol') symbol: string,
    @Query('interval') interval: string = '1d',
    @Query('range') range: string = '1mo',
    @Query('includePrePost') includePrePost: string = 'false',
    @Query('events') events: string = 'div,split',
  ): Observable<any> {
    return this.yahooFinanceService.getStockChart(
      symbol,
      interval,
      range,
      includePrePost,
      events,
    );
  }

  @Get('market-indices')
  getMarketIndices(): Observable<any> {
    return this.yahooFinanceService.getMarketIndices();
  }
}
