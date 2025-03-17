// src/watchlists/dto/update-watchlist.dto.ts
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWatchlistDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
