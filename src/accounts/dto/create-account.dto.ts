import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';


export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  // Add more fields as needed for different account types
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