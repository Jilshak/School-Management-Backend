import {
  IsDate,
  IsString,
  IsEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveReqDto {
  @ApiProperty()
  @IsDate()
  @IsEmpty()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsDate()
  @IsEmpty()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsString()
  @IsEmpty()
  reason: string;
}
