import { IsString, IsEnum, IsNumber, IsArray, ValidateNested, IsMongoId, Min, Max, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class FeeTypeDto {
  @ApiProperty()
  @IsMongoId()
  _id: string | Types.ObjectId;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNumber()
  count: number;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;
}

export class CreateFeeStructureDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: ['monthly', 'bimonthly', 'quarterly', 'semiannually'] })
  @IsEnum(['monthly', 'bimonthly', 'quarterly', 'semiannually'])
  frequency: string;

  @ApiProperty({ minimum: 1, maximum: 30 })
  @IsNumber()
  @Min(1)
  @Max(30)
  dueDate: number;

  @ApiProperty({ type: [FeeTypeDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => FeeTypeDto)
  selectedFeeTypes: FeeTypeDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsMongoId({ each: true })
  @ArrayMinSize(1)
  selectedStudents: Types.ObjectId[];
}