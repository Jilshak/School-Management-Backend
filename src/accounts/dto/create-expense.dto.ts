import { IsNotEmpty, IsString, IsNumber, IsDate, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateExpenseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  createdBy?: Types.ObjectId;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsMongoId()
  updatedBy?: Types.ObjectId;
}