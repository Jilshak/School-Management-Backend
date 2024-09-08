import { IsString, IsDate, IsEmail, IsPhoneNumber, IsMongoId, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';

export class CreateAdmissionDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  studentName: string;

  @ApiProperty({ example: '2023-09-01' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ example: 'Grade 10' })
  @IsString()
  gradeApplying: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ example: '123 Main St, Anytown, AN 12345' })
  @IsString()
  address: string;

  @ApiProperty({ required: false, example: 'Previous School Name' })
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  schoolId: ObjectId;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  admissionFee: number;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsMongoId()
  userId: ObjectId;

  @ApiProperty({ required: false, example: '507f1f77bcf86cd799439013' })
  @IsOptional()
  @IsMongoId()
  studentId?: ObjectId;
}