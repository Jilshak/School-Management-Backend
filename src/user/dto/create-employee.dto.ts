import { IsString, IsEmail, IsPhoneNumber, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsDate()
  @Type(() => Date)
  dateOfJoining: Date;

  @ApiProperty({ example: 'Teacher', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Mathematics', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  // Add any other employee-specific fields here
}