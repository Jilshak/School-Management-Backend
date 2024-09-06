import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetBooksDto {
  @ApiPropertyOptional({ description: 'Filter books by title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Filter books by author' })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({ description: 'Filter books by ISBN' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}