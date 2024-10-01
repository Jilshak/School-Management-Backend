import {
  IsDate,
  IsMongoId,
  IsArray,
  ValidateNested,
  IsEnum,
  IsString,
  IsEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LeaveReqDto {
  @IsDate()
  @IsEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsEmpty()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  @IsEmpty()
  reason: string;
}
