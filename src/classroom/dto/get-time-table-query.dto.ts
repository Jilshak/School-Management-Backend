import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetTimeTableQueryDto {
  @ApiPropertyOptional({ description: 'The ID of the classroom to filter the time table' })
  @IsOptional()
  @IsString()
  classroomId?: string;

  @ApiPropertyOptional({ description: 'The date to filter the time table' })
  @IsOptional()
  @IsDateString()
  date?: string;
}