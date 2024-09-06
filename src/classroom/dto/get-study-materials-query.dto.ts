import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetStudyMaterialsQueryDto {
  @ApiPropertyOptional({ description: 'The ID of the subject to filter study materials' })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'The type of study material' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Number of items per page' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}