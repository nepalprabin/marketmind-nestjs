// src/external-api/yahoo-finance/yahoo-finance.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, catchError, map, forkJoin, of } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class YahooFinanceService {
  private readonly logger = new Logger(YahooFinanceService.name);

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  async searchStocks(query: string): Promise<any[]> {
    try {
      // For MVP, return mock data
      // In a real implementation, you would call the Yahoo Finance API
      return this.getMockStockSearchResults(query);
    } catch (error) {
      this.logger.error(`Error searching stocks: ${error.message}`);
      return [];
    }
  }

  async getStockDetails(symbol: string): Promise<any> {
    try {
      // For MVP, return mock data
      // In a real implementation, you would call the Yahoo Finance API
      return this.getMockStockDetails(symbol);
    } catch (error) {
      this.logger.error(`Error getting stock details: ${error.message}`);
      throw error;
    }
  }

  private getMockStockSearchResults(query: string): any[] {
    // Mock data for stock search
    const mockStocks = [
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
    ];

    // Filter based on query
    const upperQuery = query.toUpperCase();
    return mockStocks.filter(
      (stock) =>
        stock.symbol.includes(upperQuery) ||
        stock.name.toUpperCase().includes(upperQuery),
    );
  }

  private getMockStockDetails(symbol: string): any {
    // Mock data for stock details
    const mockStocks = {
      AAPL: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Consumer Electronics',
      },
      MSFT: {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Software',
      },
      GOOGL: {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Internet Content & Information',
      },
      AMZN: {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        exchange: 'NASDAQ',
        sector: 'Consumer Cyclical',
        industry: 'Internet Retail',
      },
      META: {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Internet Content & Information',
      },
      TSLA: {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        exchange: 'NASDAQ',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
      },
      NFLX: {
        symbol: 'NFLX',
        name: 'Netflix Inc.',
        exchange: 'NASDAQ',
        sector: 'Communication Services',
        industry: 'Entertainment',
      },
      NVDA: {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        exchange: 'NASDAQ',
        sector: 'Technology',
        industry: 'Semiconductors',
      },
    };

    const upperSymbol = symbol.toUpperCase();

    // Return stock details if found
    if (mockStocks[upperSymbol]) {
      return mockStocks[upperSymbol];
    }

    // If not found in mock data, create a basic record
    return {
      symbol: upperSymbol,
      name: upperSymbol,
      exchange: 'UNKNOWN',
      sector: 'UNKNOWN',
      industry: 'UNKNOWN',
    };
  }

  async getEarningsForDateRange(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    try {
      // For MVP, return mock data
      // In a real implementation, you would call the Yahoo Finance API
      return this.getMockEarningsData(startDate, endDate);
    } catch (error) {
      this.logger.error(`Error getting earnings data: ${error.message}`);
      throw error;
    }
  }

  private getMockEarningsData(startDate: string, endDate: string): any[] {
    // Parse start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate random earnings dates within the range
    const mockEarnings = new Array();
    const companies = [
      { symbol: 'AAPL', companyName: 'Apple Inc.' },
      { symbol: 'MSFT', companyName: 'Microsoft Corporation' },
      { symbol: 'GOOGL', companyName: 'Alphabet Inc.' },
      { symbol: 'AMZN', companyName: 'Amazon.com Inc.' },
      { symbol: 'META', companyName: 'Meta Platforms Inc.' },
      { symbol: 'TSLA', companyName: 'Tesla Inc.' },
      { symbol: 'NFLX', companyName: 'Netflix Inc.' },
      { symbol: 'NVDA', companyName: 'NVIDIA Corporation' },
      { symbol: 'JPM', companyName: 'JPMorgan Chase & Co.' },
      { symbol: 'V', companyName: 'Visa Inc.' },
      { symbol: 'WMT', companyName: 'Walmart Inc.' },
      { symbol: 'PG', companyName: 'Procter & Gamble Co.' },
      { symbol: 'DIS', companyName: 'The Walt Disney Company' },
      { symbol: 'CSCO', companyName: 'Cisco Systems, Inc.' },
      { symbol: 'INTC', companyName: 'Intel Corporation' },
    ];

    // Assign random earnings dates to companies
    for (const company of companies) {
      // 70% chance of having earnings in this week
      if (Math.random() < 0.7) {
        // Generate a random date within the range
        const randomDays = Math.floor(
          Math.random() *
            ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
        );
        const earningsDate = new Date(start);
        earningsDate.setDate(start.getDate() + randomDays);

        // Format the date as YYYY-MM-DD
        const formattedDate = earningsDate.toISOString().split('T')[0];

        // Generate random earnings data
        const timeOfAnnouncement = Math.random() < 0.5 ? 'BMO' : 'AMC'; // Before Market Open or After Market Close
        const epsEstimate = parseFloat((Math.random() * 3 + 0.5).toFixed(2));
        const epsActual =
          Math.random() < 0.7
            ? parseFloat((epsEstimate + (Math.random() * 0.4 - 0.2)).toFixed(2))
            : null;
        const revenueEstimate = parseFloat(
          (Math.random() * 10000 + 1000).toFixed(2),
        );
        const revenueActual =
          Math.random() < 0.7
            ? parseFloat(
                (revenueEstimate + (Math.random() * 1000 - 500)).toFixed(2),
              )
            : null;

        // Determine fiscal quarter and year
        const currentYear = new Date().getFullYear();
        const quarter = Math.floor(Math.random() * 4) + 1;
        const fiscalYear = Math.random() < 0.8 ? currentYear : currentYear - 1;

        mockEarnings.push({
          symbol: company.symbol,
          companyName: company.companyName,
          earningsDate: formattedDate,
          timeOfAnnouncement,
          epsEstimate,
          epsActual,
          revenueEstimate,
          revenueActual,
          fiscalQuarter: `Q${quarter}`,
          fiscalYear: fiscalYear.toString(),
        });
      }
    }

    return mockEarnings;
  }

  getStockChart(
    symbol: string,
    interval: string = '1d',
    range: string = '1mo',
    includePrePost: string = 'false',
    events: string = 'div,split',
  ): Observable<any> {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

    this.logger.log(`Fetching chart data for ${symbol} with range ${range}`);

    return this.httpService
      .get(url, {
        params: {
          interval,
          range,
          includePrePost,
          events,
        },
      })
      .pipe(
        map((response: AxiosResponse) => response.data),
        catchError((error) => {
          this.logger.error(`Error fetching chart data: ${error.message}`);
          throw error;
        }),
      );
  }

  getMarketIndices(): Observable<any> {
    const indices = ['^GSPC', '^IXIC', '^DJI', 'BTC-USD'];

    // Create an observable for each index request
    const requests = indices.map((symbol) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

      return this.httpService
        .get(url, {
          params: {
            interval: '1d',
            range: '1d',
          },
        })
        .pipe(
          map((response: AxiosResponse) => {
            const data = response.data.chart.result[0];
            const quote = data.indicators.quote[0];
            const lastIndex = quote.close.length - 1;

            return {
              symbol,
              name: this.getIndexName(symbol),
              price: quote.close[lastIndex],
              previousClose: data.meta.chartPreviousClose,
              change: quote.close[lastIndex] - data.meta.chartPreviousClose,
              changePercent:
                ((quote.close[lastIndex] - data.meta.chartPreviousClose) /
                  data.meta.chartPreviousClose) *
                100,
            };
          }),
          catchError((error) => {
            this.logger.error(
              `Error fetching data for ${symbol}: ${error.message}`,
            );
            // Return a placeholder object instead of failing the entire request
            return of({
              symbol,
              name: this.getIndexName(symbol),
              price: 0,
              previousClose: 0,
              change: 0,
              changePercent: 0,
              error: true,
            });
          }),
        );
    });

    // Combine all requests into a single observable that emits when all requests complete
    return forkJoin(requests).pipe(
      map((results) => {
        // Convert array of results to an object with symbols as keys
        const resultObject = {};
        results.forEach((item) => {
          resultObject[item.symbol] = item;
        });
        return resultObject;
      }),
    );
  }

  private getIndexName(symbol: string): string {
    const names = {
      '^GSPC': 'S&P 500',
      '^IXIC': 'NASDAQ',
      '^DJI': 'Dow Jones',
      'BTC-USD': 'Bitcoin USD',
    };
    return names[symbol] || symbol;
  }
}
