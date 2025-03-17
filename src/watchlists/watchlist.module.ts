// src/watchlists/watchlists.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchlistsService } from './watchlists.service';
import { WatchlistsController } from './watchlists.controller';
import { Watchlist } from './entities/watchlist.entity';
import { WatchlistStock } from './entities/watchlist-stock.entity';
import { Stock } from '../stocks/entities/stocks.entity';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Watchlist, WatchlistStock, Stock]),
    StocksModule,
  ],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
  exports: [WatchlistsService],
})
export class WatchlistsModule {}
