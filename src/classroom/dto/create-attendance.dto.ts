import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @ApiProperty({ description: 'The ID of the classroom' })
  @IsNotEmpty()
  @IsString()
  classroomId: string;

  @ApiProperty({ description: 'The date of the attendance' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'Array of IDs of present students', type: [String] })
  @IsArray()
  @IsString({ each: true })
  presentStudents: string[];

  @ApiProperty({ description: 'Array of IDs of absent students', type: [String] })
  @IsArray()
  @IsString({ each: true })
  absentStudents: string[];
}