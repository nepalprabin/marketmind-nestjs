// src/watchlists/watchlists.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watchlist } from './entities/watchlist.entity';
import { WatchlistStock } from './entities/watchlist-stock.entity';
import { Stock } from '../stocks/entities/stocks.entity';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { StocksService } from '../stocks/stocks.service';

@Injectable()
export class WatchlistsService {
  private readonly logger = new Logger(WatchlistsService.name);

  constructor(
    @InjectRepository(Watchlist)
    private watchlistsRepository: Repository<Watchlist>,
    @InjectRepository(WatchlistStock)
    private watchlistStocksRepository: Repository<WatchlistStock>,
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
    private stocksService: StocksService,
  ) {}

  async create(
    userId: string,
    createWatchlistDto: CreateWatchlistDto,
  ): Promise<Watchlist> {
    try {
      const watchlist = this.watchlistsRepository.create({
        ...createWatchlistDto,
        userId,
      });
      return this.watchlistsRepository.save(watchlist);
    } catch (error) {
      this.logger.error(`Error creating watchlist: ${error.message}`);
      throw new BadRequestException('Failed to create watchlist');
    }
  }

  async findAllByUser(userId: string): Promise<Watchlist[]> {
    try {
      return this.watchlistsRepository.find({
        where: { userId },
        relations: ['watchlistStocks', 'watchlistStocks.stock'],
      });
    } catch (error) {
      this.logger.error(
        `Error finding watchlists for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Watchlist> {
    try {
      const watchlist = await this.watchlistsRepository.findOne({
        where: { id, userId },
        relations: ['watchlistStocks', 'watchlistStocks.stock'],
      });

      if (!watchlist) {
        throw new NotFoundException(`Watchlist with ID ${id} not found`);
      }

      return watchlist;
    } catch (error) {
      this.logger.error(`Error finding watchlist ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    updateWatchlistDto: UpdateWatchlistDto,
  ): Promise<Watchlist> {
    try {
      const watchlist = await this.findOne(id, userId);

      await this.watchlistsRepository.update(
        { id, userId },
        updateWatchlistDto,
      );

      return this.findOne(id, userId);
    } catch (error) {
      this.logger.error(`Error updating watchlist ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const watchlist = await this.findOne(id, userId);
      await this.watchlistsRepository.remove(watchlist);
    } catch (error) {
      this.logger.error(`Error removing watchlist ${id}: ${error.message}`);
      throw error;
    }
  }

  async addStock(
    watchlistId: string,
    userId: string,
    symbol: string,
  ): Promise<{ message: string }> {
    try {
      // Check if watchlist exists and belongs to user
      const watchlist = await this.findOne(watchlistId, userId);

      // Get or create stock
      let stock: Stock;
      try {
        // Try to get stock details from service
        stock = await this.stocksService.getStockDetails(symbol);
      } catch (error) {
        // If stock not found, create a basic record
        stock = await this.stocksRepository.save(
          this.stocksRepository.create({
            symbol: symbol.toUpperCase(),
            name: symbol.toUpperCase(), // Will be updated later when details are fetched
          }),
        );
      }

      // Check if stock already in watchlist
      const existing = await this.watchlistStocksRepository.findOne({
        where: { watchlistId, stockId: stock.id },
      });

      if (existing) {
        return { message: 'Stock already in watchlist' };
      }

      // Add stock to watchlist
      const watchlistStock = this.watchlistStocksRepository.create({
        watchlistId,
        stockId: stock.id,
      });

      await this.watchlistStocksRepository.save(watchlistStock);

      return { message: 'Stock added to watchlist' };
    } catch (error) {
      this.logger.error(
        `Error adding stock to watchlist ${watchlistId}: ${error.message}`,
      );
      throw error;
    }
  }

  async removeStock(
    watchlistId: string,
    userId: string,
    stockId: string,
  ): Promise<{ message: string }> {
    try {
      // Check if watchlist exists and belongs to user
      const watchlist = await this.findOne(watchlistId, userId);

      // Check if stock is in watchlist
      const watchlistStock = await this.watchlistStocksRepository.findOne({
        where: { watchlistId, stockId },
      });

      if (!watchlistStock) {
        throw new NotFoundException('Stock not found in watchlist');
      }

      // Remove stock from watchlist
      await this.watchlistStocksRepository.remove(watchlistStock);

      return { message: 'Stock removed from watchlist' };
    } catch (error) {
      this.logger.error(
        `Error removing stock from watchlist ${watchlistId}: ${error.message}`,
      );
      throw error;
    }
  }

  async getWatchlistStocks(
    watchlistId: string,
    userId: string,
  ): Promise<Stock[]> {
    try {
      // Check if watchlist exists and belongs to user
      const watchlist = await this.findOne(watchlistId, userId);

      // Get all stocks in watchlist
      const watchlistStocks = await this.watchlistStocksRepository.find({
        where: { watchlistId },
        relations: ['stock'],
      });

      // Extract stock entities
      return watchlistStocks.map((ws) => ws.stock);
    } catch (error) {
      this.logger.error(
        `Error getting watchlist stocks for ${watchlistId}: ${error.message}`,
      );
      throw error;
    }
  }
}
