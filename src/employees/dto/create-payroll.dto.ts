import { IsNotEmpty, IsMongoId, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayrollDto {
  @IsNotEmpty()
  @IsMongoId()
  employeeId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  payPeriodStart: Date;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  payPeriodEnd: Date;

  @IsNotEmpty()
  @IsNumber()
  basicSalary: number;

  @IsNotEmpty()
  @IsNumber()
  allowances: number;

  @IsNotEmpty()
  @IsNumber()
  deductions: number;

  @IsNotEmpty()
  @IsNumber()
  netSalary: number;
}