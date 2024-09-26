import { IsString, IsNumber, IsEnum, IsArray, IsMongoId, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class FeeDetailDto {
  @ApiProperty({ description: 'Fee Type ID' })
  @IsMongoId()
  feeType: Types.ObjectId;

  @ApiProperty({ description: 'Amount for this fee type' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ description: 'Count of this fee type' })
  @IsNumber()
  @Min(1)
  count: number;

  @ApiProperty({ description: 'Description for this fee detail' })
  @IsString()
  description: string;
}

export class CreatePaymentDueDto {
  @ApiProperty({ description: 'Name of the payment due' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Due date (day of the month)', minimum: 1, maximum: 31 })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDate: number;

  @ApiProperty({ description: 'Array of fee type IDs', type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  feeTypes: Types.ObjectId[];

  @ApiProperty({ description: 'Array of student IDs', type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  students: Types.ObjectId[];

  @ApiProperty({ description: 'Total amount of the payment due' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Detailed breakdown of fees', type: [FeeDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeDetailDto)
  feeDetails: FeeDetailDto[];
}