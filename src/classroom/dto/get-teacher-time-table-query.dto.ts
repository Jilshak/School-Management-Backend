import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GetTeacherTimeTableQueryDto {
  @ApiPropertyOptional({ description: 'The start date for the time table' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'The end date for the time table' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}