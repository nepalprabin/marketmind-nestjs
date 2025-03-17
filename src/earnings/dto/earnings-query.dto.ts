// src/earnings/dto/earnings-query.dto.ts
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class EarningsQueryDto {
  @IsOptional()
  @IsString()
  @IsEnum(['0', '1', '-1', '2', '-2', '3', '-3', '4', '-4'], {
    message:
      'Week must be a valid offset from current week (e.g., 0, 1, -1, 2, -2, etc.)',
  })
  week?: string; // Offset from current week (0 = current week, 1 = next week, -1 = previous week)

  @IsOptional()
  @IsString()
  symbol?: string; // Filter by specific stock symbol
}
