import { IsDate, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollDto {
  @ApiProperty()
  @IsMongoId()
  userId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  paid: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
