import { IsDate, IsMongoId, IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateRegularizationDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  attendanceId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: "fullDay" | "halfDay";

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isRegularized: boolean;
}

export class UpdateRegularizationDto extends PartialType(CreateRegularizationDto) {}
