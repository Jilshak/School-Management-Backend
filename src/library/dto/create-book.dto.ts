import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ description: 'The title of the book' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The author of the book' })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({ description: 'The ISBN of the book' })
  @IsNotEmpty()
  @IsString()
  isbn: string;

  @ApiProperty({ description: 'The quantity of books available' })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'The description of the book', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The status of the book', enum: ['available', 'lent', 'reserved'] })
  @IsNotEmpty()
  @IsEnum(['available', 'lent', 'reserved'])
  status: string;

  @ApiProperty({ description: 'The format of the book', enum: ['physical', 'digital'], required: false })
  @IsOptional()
  @IsEnum(['physical', 'digital'])
  format?: string;
}