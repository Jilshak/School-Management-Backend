import { IsString, IsDate, IsBoolean, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  isActive: boolean;
}

export class UpdateHolidayDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsBoolean()
  isActive?: boolean;
}
