// src/database/seeders/seeder.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { User } from '../../users/entities/user.entity';
import { Stock } from '../../stocks/entities/stocks.entity';
import { Watchlist } from '../../watchlists/entities/watchlist.entity';
import { WatchlistStock } from '../../watchlists/entities/watchlist-stock.entity';
import { EarningsEvent } from '../../earnings/entities/earnings-event.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'stock_market_app'),
        entities: [User, Stock, Watchlist, WatchlistStock, EarningsEvent],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      Stock,
      Watchlist,
      WatchlistStock,
      EarningsEvent,
    ]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
