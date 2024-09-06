import { IsNotEmpty, IsDate, IsMongoId, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  status: 'pending' | 'approved' | 'rejected';
}