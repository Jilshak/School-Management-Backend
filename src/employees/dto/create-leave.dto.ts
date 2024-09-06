import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaveDto {
  @ApiProperty({ description: 'The ID of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'The start date of the leave', required: true })
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiProperty({ description: 'The end date of the leave', required: true })
  @IsNotEmpty()
  @IsDateString()
  endDate: Date;

  @ApiProperty({ description: 'The reason for the leave', required: true })
  @IsNotEmpty()
  @IsString()
  reason: string;
}