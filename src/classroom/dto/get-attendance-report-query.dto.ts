import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class GetAttendanceReportQueryDto {
  @ApiProperty({ description: 'The start date for the attendance report' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'The end date for the attendance report' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}