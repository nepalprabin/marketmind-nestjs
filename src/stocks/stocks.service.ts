// src/stocks/stocks.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Stock } from './entities/stocks.entity';
import { YahooFinanceService } from '../external-api/yahoo-finance/yahoo-finance.service';

@Injectable()
export class StocksService {
  private readonly logger = new Logger(StocksService.name);

  constructor(
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
    private yahooFinanceService: YahooFinanceService,
  ) {}

  async searchStocks(query: string): Promise<Stock[]> {
    try {
      // First check database
      const dbStocks = await this.stocksRepository.find({
        where: [
          { symbol: Like(`%${query.toUpperCase()}%`) },
          { name: Like(`%${query}%`) },
        ],
        take: 10,
      });

      if (dbStocks.length > 0) {
        return dbStocks;
      }

      // If not found in database, search via Yahoo Finance API
      const apiStocks = await this.yahooFinanceService.searchStocks(query);

      // Save new stocks to database
      const savedStocks = new Array();
      for (const stock of apiStocks) {
        const savedStock = await this.createOrUpdateStock(stock);
        savedStocks.push(savedStock);
      }

      return savedStocks;
    } catch (error) {
      this.logger.error(`Failed to search stocks: ${error.message}`);
      return [];
    }
  }

  async getStockDetails(symbol: string): Promise<Stock> {
    try {
      // Check if stock exists in database
      let stock = await this.stocksRepository.findOne({
        where: { symbol: symbol.toUpperCase() },
      });

      if (!stock) {
        // If not found, fetch from API
        const stockDetails =
          await this.yahooFinanceService.getStockDetails(symbol);
        stock = await this.createOrUpdateStock(stockDetails);
      }

      return stock;
    } catch (error) {
      this.logger.error(
        `Failed to get stock details for ${symbol}: ${error.message}`,
      );
      throw new NotFoundException(`Stock not found: ${symbol}`);
    }
  }

  private async createOrUpdateStock(stockData: any): Promise<Stock> {
    try {
      let stock = await this.stocksRepository.findOne({
        where: { symbol: stockData.symbol.toUpperCase() },
      });

      if (!stock) {
        stock = this.stocksRepository.create({
          symbol: stockData.symbol.toUpperCase(),
          name: stockData.name || stockData.shortName || stockData.symbol,
          exchange:
            stockData.exchange || stockData.fullExchangeName || 'UNKNOWN',
          sector: stockData.sector || 'UNKNOWN',
          industry: stockData.industry || 'UNKNOWN',
        });
      } else {
        // Update existing stock
        stock.name = stockData.name || stockData.shortName || stock.name;
        stock.exchange =
          stockData.exchange || stockData.fullExchangeName || stock.exchange;
        stock.sector = stockData.sector || stock.sector;
        stock.industry = stockData.industry || stock.industry;
      }

      return this.stocksRepository.save(stock);
    } catch (error) {
      this.logger.error(`Failed to create/update stock: ${error.message}`);
      throw error;
    }
  }
}
