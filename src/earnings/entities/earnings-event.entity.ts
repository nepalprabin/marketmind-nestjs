// src/earnings/entities/earnings-event.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Stock } from '../../stocks/entities/stocks.entity';

@Entity('earnings_events')
export class EarningsEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  stockId: string;

  @ManyToOne(() => Stock)
  @JoinColumn({ name: 'stockId' })
  stock: Stock;

  @Column({ type: 'date' })
  earningsDate: Date;

  @Column({ nullable: true })
  earningsTime: string; // 'BMO' (Before Market Open) or 'AMC' (After Market Close)

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  epsEstimate: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  epsActual: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  revenueEstimate: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  revenueActual: number;

  @Column({ nullable: true })
  fiscalQuarter: string;

  @Column({ nullable: true })
  fiscalYear: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
