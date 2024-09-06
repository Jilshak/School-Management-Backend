import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

enum StaffRole {
  TEACHER = 'teacher',
  ADMIN = 'admin',
  SUPPORT = 'support'
}

export class CreateStaffDto {
  @ApiProperty({ description: 'The first name of the staff member' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the staff member' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The email of the staff member' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'The role of the staff member', enum: StaffRole })
  @IsNotEmpty()
  @IsEnum(StaffRole)
  role: StaffRole;

  @ApiProperty({ description: 'The date of joining of the staff member' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfJoining: Date;

  @ApiProperty({ description: 'The department of the staff member', required: false })
  @IsOptional()
  @IsString()
  department?: string;
}