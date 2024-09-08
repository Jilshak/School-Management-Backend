import { IsString, IsDate, IsEnum, IsEmail, IsPhoneNumber, IsMongoId, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Gender } from '../../domains/enums/gender.enum';

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

export class CreateStudentDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439013' })
  @IsMongoId()
  userId: ObjectId;

  @ApiProperty({ example: '2000-01-01' })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'American' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: '+1987654321' })
  @IsPhoneNumber()
  contactNumber: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email: string;

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
  schoolID: ObjectId;

  @ApiProperty({
    type: ParentsDetails,
    example: {
      guardianName: 'John Doe',
      guardianContactNumber: '+1234567890',
      guardianEmail: 'guardian@example.com',
      relationshipToStudent: 'Father'
    }
  })
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
}