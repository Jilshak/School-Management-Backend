import { IsNotEmpty, IsString, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  classroomId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsArray()
  @IsString({ each: true })
  presentStudents: string[];

  @IsArray()
  @IsString({ each: true })
  absentStudents: string[];
}