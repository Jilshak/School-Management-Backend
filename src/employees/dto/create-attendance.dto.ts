import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'The ID of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'The date of attendance', required: true })
  @IsNotEmpty()
  @IsDateString()
  date: Date;

  @ApiProperty({ description: 'The status of attendance (e.g., present, absent)', required: true })
  @IsNotEmpty()
  @IsString()
  status: string;
}