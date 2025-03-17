// src/watchlists/dto/create-watchlist.dto.ts
import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWatchlistDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
