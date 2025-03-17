// src/stocks/stocks.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StocksService } from './stocks.service';

@Controller('stocks')
@UseGuards(JwtAuthGuard)
export class StocksController {
  private readonly logger = new Logger(StocksController.name);

  constructor(private readonly stocksService: StocksService) {}

  @Get('search')
  search(@Query('query') query: string) {
    this.logger.log(`Searching stocks with query: ${query}`);
    return this.stocksService.searchStocks(query);
  }

  @Get(':symbol')
  getStockDetails(@Param('symbol') symbol: string) {
    this.logger.log(`Getting details for stock: ${symbol}`);
    return this.stocksService.getStockDetails(symbol);
  }
}
