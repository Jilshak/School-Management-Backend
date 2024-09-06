import { IsNotEmpty, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayrollDto {
  @ApiProperty({ description: 'The ID of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ description: 'The payroll period start date', required: true })
  @IsNotEmpty()
  @IsDateString()
  periodStart: Date;

  @ApiProperty({ description: 'The payroll period end date', required: true })
  @IsNotEmpty()
  @IsDateString()
  periodEnd: Date;

  @ApiProperty({ description: 'The base salary amount', required: true })
  @IsNotEmpty()
  @IsNumber()
  baseSalary: number;

  @ApiProperty({ description: 'Any additional allowances', required: true })
  @IsNotEmpty()
  @IsNumber()
  allowances: number;

  @ApiProperty({ description: 'Any deductions from the salary', required: true })
  @IsNotEmpty()
  @IsNumber()
  deductions: number;
}