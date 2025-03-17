// src/earnings/earnings.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EarningsEvent } from './entities/earnings-event.entity';
import { Stock } from '../stocks/entities/stocks.entity';
import { EarningsQueryDto } from './dto/earnings-query.dto';
import { YahooFinanceService } from '../external-api/yahoo-finance/yahoo-finance.service';

@Injectable()
export class EarningsService {
  private readonly logger = new Logger(EarningsService.name);

  constructor(
    @InjectRepository(EarningsEvent)
    private earningsRepository: Repository<EarningsEvent>,
    @InjectRepository(Stock)
    private stocksRepository: Repository<Stock>,
    private yahooFinanceService: YahooFinanceService,
  ) {}

  async getEarningsCalendar(query: EarningsQueryDto) {
    try {
      // Calculate start and end dates based on the week parameter
      const { week, symbol } = query;
      const today = new Date();

      // Default to current week if not specified
      const weekOffset = week ? parseInt(week) : 0;

      // Calculate the start of the current week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);
      startOfWeek.setHours(0, 0, 0, 0);

      // Calculate the end of the week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Format dates for API and display
      const startDate = startOfWeek.toISOString().split('T')[0];
      const endDate = endOfWeek.toISOString().split('T')[0];

      // Check if we have earnings data for this week in our database
      let earningsEvents = await this.findEarningsEventsForWeek(
        startOfWeek,
        endOfWeek,
        symbol,
      );

      // If we don't have enough data or it's the current/future week, fetch from API
      if (earningsEvents.length < 5 || weekOffset >= 0) {
        // Call Yahoo Finance API to get earnings for the date range
        const earningsData =
          await this.yahooFinanceService.getEarningsForDateRange(
            startDate,
            endDate,
          );

        // Save the earnings data to our database
        await this.saveEarningsData(earningsData);

        // Fetch the updated earnings events
        earningsEvents = await this.findEarningsEventsForWeek(
          startOfWeek,
          endOfWeek,
          symbol,
        );
      }

      // Group earnings by date for easier frontend rendering
      const earningsByDate = this.groupEarningsByDate(earningsEvents);

      return {
        weekStart: startDate,
        weekEnd: endDate,
        earningsByDate,
        earnings: earningsEvents,
        previousWeek: (weekOffset - 1).toString(),
        currentWeek: weekOffset.toString(),
        nextWeek: (weekOffset + 1).toString(),
      };
    } catch (error) {
      this.logger.error(`Error getting earnings calendar: ${error.message}`);
      throw error;
    }
  }

  private async findEarningsEventsForWeek(
    startDate: Date,
    endDate: Date,
    symbol?: string,
  ) {
    try {
      const queryBuilder = this.earningsRepository
        .createQueryBuilder('earnings')
        .leftJoinAndSelect('earnings.stock', 'stock')
        .where('earnings.earningsDate BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });

      // Add symbol filter if provided
      if (symbol) {
        queryBuilder.andWhere('stock.symbol = :symbol', {
          symbol: symbol.toUpperCase(),
        });
      }

      return queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Error finding earnings events: ${error.message}`);
      return [];
    }
  }

  private async saveEarningsData(earningsData: any[]) {
    try {
      for (const item of earningsData) {
        // Find or create stock
        let stock = await this.stocksRepository.findOne({
          where: { symbol: item.symbol.toUpperCase() },
        });

        if (!stock) {
          stock = this.stocksRepository.create({
            symbol: item.symbol.toUpperCase(),
            name: item.companyName || item.symbol,
          });
          stock = await this.stocksRepository.save(stock);
        }

        // Check if earnings event already exists
        const existingEvent = await this.earningsRepository.findOne({
          where: {
            stockId: stock.id,
            earningsDate: new Date(item.earningsDate),
          },
        });

        if (existingEvent) {
          // Update existing event
          await this.earningsRepository.update(existingEvent.id, {
            epsEstimate: item.epsEstimate,
            epsActual: item.epsActual,
            revenueEstimate: item.revenueEstimate,
            revenueActual: item.revenueActual,
            earningsTime: item.timeOfAnnouncement,
            fiscalQuarter: item.fiscalQuarter,
            fiscalYear: item.fiscalYear,
          });
        } else {
          // Create new earnings event
          const earningsEvent = this.earningsRepository.create({
            stockId: stock.id,
            earningsDate: new Date(item.earningsDate),
            epsEstimate: item.epsEstimate,
            epsActual: item.epsActual,
            revenueEstimate: item.revenueEstimate,
            revenueActual: item.revenueActual,
            earningsTime: item.timeOfAnnouncement,
            fiscalQuarter: item.fiscalQuarter,
            fiscalYear: item.fiscalYear,
          });

          await this.earningsRepository.save(earningsEvent);

          // Update stock with latest earnings info
          await this.stocksRepository.update(stock.id, {
            nextEarningsDate: new Date(item.earningsDate),
            // epsEstimate: item.epsEstimate,
            // earningsTime: item.timeOfAnnouncement,
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error saving earnings data: ${error.message}`);
      throw error;
    }
  }

  private groupEarningsByDate(earningsEvents: EarningsEvent[]) {
    const grouped = {};

    for (const event of earningsEvents) {
      const earningsDate = new Date(event.earningsDate);
      const date = earningsDate.toISOString().split('T')[0];

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        id: event.id,
        symbol: event.stock.symbol,
        companyName: event.stock.name,
        earningsDate: date,
        earningsTime: event.earningsTime,
        epsEstimate: event.epsEstimate,
        epsActual: event.epsActual,
        revenueEstimate: event.revenueEstimate,
        revenueActual: event.revenueActual,
        fiscalQuarter: event.fiscalQuarter,
        fiscalYear: event.fiscalYear,
      });
    }

    return grouped;
  }
}
