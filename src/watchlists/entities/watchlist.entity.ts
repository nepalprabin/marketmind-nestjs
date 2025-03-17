// src/watchlists/entities/watchlist.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WatchlistStock } from './watchlist-stock.entity';

@Entity('watchlists')
export class Watchlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.watchlists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(
    () => WatchlistStock,
    (watchlistStock) => watchlistStock.watchlist,
    {
      cascade: true,
    },
  )
  watchlistStocks: WatchlistStock[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
