import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAttendanceDto } from './create-attendance.dto';

export class TakeAttendanceDto {
  @ApiProperty({ type: [CreateAttendanceDto], description: 'Array of attendance records' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAttendanceDto)
  attendances: CreateAttendanceDto[];
}