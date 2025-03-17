// watchlists/entities/watchlist-stock.entity.ts
import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Watchlist } from './watchlist.entity';
import { Stock } from '../../stocks/entities/stocks.entity';

@Entity('watchlist_stocks')
export class WatchlistStock {
  @PrimaryColumn()
  watchlistId: string;

  @PrimaryColumn()
  stockId: string;

  @ManyToOne(() => Watchlist, (watchlist) => watchlist.watchlistStocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'watchlistId' })
  watchlist: Watchlist;

  @ManyToOne(() => Stock, (stock) => stock.watchlistStocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'stockId' })
  stock: Stock;

  @CreateDateColumn()
  addedAt: Date;
}
