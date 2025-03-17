// src/database/seeders/seeder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from '../../stocks/entities/stocks.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
  ) {}

  async seed() {
    await this.seedStocks();
    this.logger.log('Seeding completed');
  }

  private async seedStocks() {
    const stocksCount = await this.stocksRepository.count();

    if (stocksCount > 0) {
      this.logger.log('Stocks already seeded');
      return;
    }

    const stocks = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Consumer Electronics',
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Software',
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Internet Content & Information',
      },
      {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        exchange: 'NASDAQ',
        sector: 'Consumer Cyclical',
        industry: 'Internet Retail',
      },
      {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Internet Content & Information',
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        exchange: 'NASDAQ',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
      },
      {
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        exchange: 'NASDAQ',
        sector: 'Communication Services',
        industry: 'Entertainment',
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Semiconductors',
      },
      {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        exchange: 'NYSE',
        sector: 'Financial Services',
        industry: 'Banks',
      },
      {
        symbol: 'V',
        name: 'Visa Inc.',
        exchange: 'NYSE',
        sector: 'Financial Services',
        industry: 'Credit Services',
      },
    ];

    for (const stockData of stocks) {
      const stock = this.stocksRepository.create(stockData);
      await this.stocksRepository.save(stock);
    }

    this.logger.log(`Seeded ${stocks.length} stocks`);
  }
}
