import { IsEmail, IsString, IsEnum, IsDate, IsOptional, IsMongoId, ValidateNested, IsBoolean, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domains/enums/user-roles.enum';
import { Gender } from '../../domains/enums/gender.enum';
import { ObjectId } from 'mongodb';

class ParentsDetails {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  guardianName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  guardianContactNumber: string;

  @ApiProperty({ required: false, example: 'guardian@example.com' })
  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @ApiProperty({ example: 'Father' })
  @IsString()
  relationshipToStudent: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '2000-01-01' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'American' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  contactNumber: string;

  @ApiProperty({ example: '123 Main St, Anytown, AN 12345' })
  @IsString()
  address: string;

  @ApiProperty({ example: '2023-09-01' })
  @IsDate()
  @Type(() => Date)
  admissionDate: Date;

  @ApiProperty({ example: '10' })
  @IsString()
  grade: string;

  @ApiProperty({ required: false, example: 'A' })
  @IsString()
  @IsOptional()
  section?: string;

  @ApiProperty({ example: 'EN2023001' })
  @IsString()
  enrollmentNumber: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  classID: ObjectId;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  schoolId: ObjectId;

  @ApiProperty({ type: ParentsDetails })
  @ValidateNested()
  @Type(() => ParentsDetails)
  parentsDetails: ParentsDetails;

  @ApiProperty({ required: false, example: '1234 5678 9012' })
  @IsString()
  @IsOptional()
  adhaar?: string;

  @ApiProperty({ example: 'Emergency Contact' })
  @IsString()
  emergencyContactName: string;

  @ApiProperty({ example: '+1122334455' })
  @IsPhoneNumber()
  emergencyContactNumber: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;

  // Employee-specific fields
  @ApiProperty({ required: false, example: '2023-01-01' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfJoining?: Date;

  @ApiProperty({ required: false, example: 'Teacher' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ required: false, example: 'Mathematics' })
  @IsString()
  @IsOptional()
  department?: string;
}