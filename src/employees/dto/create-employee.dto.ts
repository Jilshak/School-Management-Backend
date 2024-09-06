import { IsNotEmpty, IsString, IsEmail, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmployeeRole } from 'src/auth/enums/auth.enums';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'The first name of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The email address of the employee', required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The mobile number of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  mobile: string;

  @ApiProperty({ description: 'The role of the employee', enum: EmployeeRole, required: true })
  @IsNotEmpty()
  @IsEnum(EmployeeRole)
  role: EmployeeRole;

  @ApiProperty({ description: 'The date of birth of the employee', required: true })
  @IsNotEmpty()
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({ description: 'The address of the employee', required: true })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The qualifications of the employee', required: false })
  @IsOptional()
  @IsString({ each: true })
  qualifications?: string[];

  @ApiProperty({ description: 'The experience of the employee', required: false })
  @IsOptional()
  @IsString()
  experience?: string;
}