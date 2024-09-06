import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsArray, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMessDto {
  @ApiProperty({ description: 'The date of the mess menu' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'The meal type (e.g., breakfast, lunch, dinner)' })
  @IsNotEmpty()
  @IsString()
  meal: string;

  @ApiProperty({ description: 'The list of menu items', type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  menu: string[];

  @ApiProperty({ description: 'The list of special diet items', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialDiet?: string[];
}