import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetStudentsPerformanceQueryDto {
  @ApiPropertyOptional({ description: 'The ID of the subject to filter performance' })
  @IsOptional()
  @IsString()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'The start date for performance data' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'The end date for performance data' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}