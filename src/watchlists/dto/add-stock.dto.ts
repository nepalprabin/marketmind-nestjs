// src/watchlists/dto/add-stock.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class AddStockDto {
  @IsNotEmpty()
  @IsString()
  symbol: string;
}
