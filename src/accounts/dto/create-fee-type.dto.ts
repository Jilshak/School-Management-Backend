import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateFeeTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}
