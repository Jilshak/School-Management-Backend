import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId, IsDate, IsArray, ValidateNested, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

class FeeDetailDto {
  @IsOptional()
  @IsMongoId()
  feeTypeId?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  dueDateId?: string;

  @ValidateIf(o => !!o.dueDateId)
  @IsNotEmpty({ message: 'duePaymentId is required when dueDateId is present' })
  @IsMongoId()
  duePaymentId?: string;
}

export class CreateAccountDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  studentId: string | Types.ObjectId;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeeDetailDto)
  fees: FeeDetailDto[];


  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  paymentDate: Date;
}



export class CreatePaymentDueDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dueDate: Date;
}