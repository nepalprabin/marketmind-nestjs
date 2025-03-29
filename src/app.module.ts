// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WatchlistsModule } from './watchlists/watchlist.module';
import { StocksModule } from './stocks/stocks.module';
import { EarningsModule } from './earnings/earnings.module';
import { YahooFinanceModule } from './external-api/yahoo-finance/yahoo-finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'marketmind'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: configService.get('NODE_ENV') !== 'production',
        synchronize: true,
      }),
    }),
    HttpModule,
    AuthModule,
    UsersModule,
    WatchlistsModule,
    StocksModule,
    EarningsModule,
    YahooFinanceModule,
  ],
})
export class AppModule {}
