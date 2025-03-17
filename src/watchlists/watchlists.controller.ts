// src/watchlists/watchlists.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WatchlistsService } from './watchlists.service';
import { CreateWatchlistDto } from './dto/create-watchlist.dto';
import { UpdateWatchlistDto } from './dto/update-watchlist.dto';
import { AddStockDto } from './dto/add-stock.dto';

@Controller('watchlists')
@UseGuards(JwtAuthGuard)
export class WatchlistsController {
  private readonly logger = new Logger(WatchlistsController.name);

  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Post()
  create(@Req() req, @Body() createWatchlistDto: CreateWatchlistDto) {
    this.logger.log(`Creating watchlist for user ${req.user.id}`);
    return this.watchlistsService.create(req.user.id, createWatchlistDto);
  }

  @Get()
  findAll(@Req() req) {
    this.logger.log(`Finding all watchlists for user ${req.user.id}`);
    return this.watchlistsService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    this.logger.log(`Finding watchlist ${id} for user ${req.user.id}`);
    return this.watchlistsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateWatchlistDto: UpdateWatchlistDto,
  ) {
    this.logger.log(`Updating watchlist ${id} for user ${req.user.id}`);
    return this.watchlistsService.update(id, req.user.id, updateWatchlistDto);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    this.logger.log(`Removing watchlist ${id} for user ${req.user.id}`);
    return this.watchlistsService.remove(id, req.user.id);
  }

  @Post(':id/stocks')
  addStock(
    @Req() req,
    @Param('id') id: string,
    @Body() addStockDto: AddStockDto,
  ) {
    this.logger.log(
      `Adding stock ${addStockDto.symbol} to watchlist ${id} for user ${req.user.id}`,
    );
    return this.watchlistsService.addStock(id, req.user.id, addStockDto.symbol);
  }

  @Delete(':id/stocks/:stockId')
  removeStock(
    @Req() req,
    @Param('id') id: string,
    @Param('stockId') stockId: string,
  ) {
    this.logger.log(
      `Removing stock ${stockId} from watchlist ${id} for user ${req.user.id}`,
    );
    return this.watchlistsService.removeStock(id, req.user.id, stockId);
  }

  @Get(':id/stocks')
  getWatchlistStocks(@Req() req, @Param('id') id: string) {
    this.logger.log(
      `Getting stocks for watchlist ${id} for user ${req.user.id}`,
    );
    return this.watchlistsService.getWatchlistStocks(id, req.user.id);
  }
}
