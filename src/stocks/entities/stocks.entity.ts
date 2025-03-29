// stocks/entities/stock.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WatchlistStock } from '../../watchlists/entities/watchlist-stock.entity';

@Entity('stocks')
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  symbol: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  exchange: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @OneToMany(() => WatchlistStock, (watchlistStock) => watchlistStock.stock)
  watchlistStocks: WatchlistStock[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  lastEarningsDate: Date;

  @Column({ nullable: true, type: 'timestamp' })
  nextEarningsDate: Date;
}
