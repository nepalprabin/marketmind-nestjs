// src/earnings/earnings.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EarningsService } from './earnings.service';
import { EarningsQueryDto } from './dto/earnings-query.dto';

@Controller('earnings')
// @UseGuards(JwtAuthGuard)
export class EarningsController {
  private readonly logger = new Logger(EarningsController.name);

  constructor(private readonly earningsService: EarningsService) {}

  @Get()
  getEarningsCalendar(@Query() query: EarningsQueryDto) {
    this.logger.log(
      `Getting earnings calendar with query: ${JSON.stringify(query)}`,
    );
    return this.earningsService.getEarningsCalendar(query);
  }
}
