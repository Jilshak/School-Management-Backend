import {
  IsEmail,
  IsEnum,
  IsDate,
  IsOptional,
  IsMongoId,
  ValidateNested,
  IsBoolean,
  IsString,
  IsArray,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../domains/enums/user-roles.enum';
import { Gender } from '../../domains/enums/gender.enum';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';


class PaymentDetails {
  @ApiProperty({ example: 'Tuition Fee' })
  @IsString()
  @IsNotEmpty()
  fee: string;

  @ApiProperty({ example: 'First semester tuition fee', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

class ParentsDetailsDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  guardianName: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  guardianContactNumber: string;

  @ApiProperty({ example: 'Father' })
  @IsString()
  relationshipToStudent: string;
}

class QualificationDto {
  @ApiProperty({ example: 'url/to/document' })
  @IsString()
  document: string;

  @ApiProperty({ example: 'University Name' })
  @IsString()
  instituteName: string;

  @ApiProperty({ example: 'Bachelor of Education' })
  @IsString()
  degree: string;

  @ApiProperty({ example: 'Education' })
  @IsString()
  fieldOfStudy: string;

  @ApiProperty({ example: 2020 })
  @IsNumber()
  yearOfPass: number;

  @ApiProperty({ example: '85%' })
  @IsString()
  gradePercentage: string;
}

class CertificateDto {
  @ApiProperty({ example: 'Teaching Excellence' })
  @IsString()
  certificate: string;

  @ApiProperty({ example: 'Education Board' })
  @IsString()
  issueAuthority: string;

  @ApiProperty({ example: '2022-01-01' })
  @IsDate()
  @Type(() => Date)
  issueDate: Date;
}

class PublicationDto {
  @ApiProperty({ example: 'url/to/document' })
  @IsString()
  document: string;

  @ApiProperty({ example: 'Modern Teaching Methods' })
  @IsString()
  publicationName: string;

  @ApiProperty({ example: '2021-06-15' })
  @IsDate()
  @Type(() => Date)
  publicationDate: Date;

  @ApiProperty({ example: 'https://example.com/publication' })
  @IsString()
  linkUrl: string;
}

class PreviousEmploymentDto {
  @ApiProperty({ example: 'url/to/document' })
  @IsString()
  document: string;

  @ApiProperty({ example: 'Previous School' })
  @IsString()
  instituteName: string;

  @ApiProperty({ example: 'Teacher' })
  @IsString()
  role: string;

  @ApiProperty({ example: '2018-01-01' })
  @IsDate()
  @Type(() => Date)
  joinedDate: Date;

  @ApiProperty({ example: '2022-12-31' })
  @IsDate()
  @Type(() => Date)
  revealedDate: Date;
}




export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: [UserRole.ADMISSION_TEAM,UserRole.ACCOUNTANT,UserRole.TEACHER],type:[String] })
  @IsArray()
  roles: UserRole[];

  @ApiProperty({type:String,required:false})
  @IsString()
  @IsOptional()
  bloodGroup?:string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: ['Swimming', 'Chess'], description: 'List of extracurricular activities', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  extraCurricular?: string[];

  @ApiProperty({ example: ['Swimming', 'Chess'], description: 'List of extracurricular activities', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];

  @ApiProperty({ example: "Remarks" })
  @IsOptional()
  @IsString()
  remarks?: string;

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
  @IsString()
  contactNumber: string;

  @ApiProperty({ example: '123 Main St, Anytown, AN 12345' })
  @IsString()
  address: string;

  @ApiProperty({ required: false, example: 'California' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ required: false, example: '1234 5678 9012' })
  @IsString()
  @IsOptional()
  adhaarNumber?: string;

  @ApiProperty({ required: false, example: 'url/to/adhaar/document' })
  @IsString()
  @IsOptional()
  adhaarDocument?: string;

  @ApiProperty({ required: false, example: 'ABCDE1234F' })
  @IsString()
  @IsOptional()
  pancardNumber?: string;

  @ApiProperty({ required: false, example: 'url/to/pancard/document' })
  @IsString()
  @IsOptional()
  pancardDocument?: string;

  @ApiProperty({ example: '2023-01-01' })
  @IsDate()
  @Type(() => Date)
  joinDate: Date;

  @ApiProperty({ example: 'Emergency Contact' })
  @IsString()
  emergencyContactName: string;

  @ApiProperty({ example: '+1122334455' })
  @IsString()
  emergencyContactNumber: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsOptional()
  @IsMongoId()
  schoolId: ObjectId;

  @ApiProperty({ required: false, example: 'IT' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiProperty({ required: false, example: 'Senior Developer' })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({ type: [QualificationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualificationDto)
  @IsOptional()
  qualifications?: QualificationDto[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @Type(() => String)
  @IsOptional()
  subjects?: string[];

  @ApiProperty({ type: [CertificateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CertificateDto)
  @IsOptional()
  certificates?: CertificateDto[];

  @ApiProperty({ type: [PublicationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicationDto)
  @IsOptional()
  publications?: PublicationDto[];

  @ApiProperty({ type: [PreviousEmploymentDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreviousEmploymentDto)
  @IsOptional()
  previousEmployments?: PreviousEmploymentDto[];

  @ApiProperty({ required: false, example: 'ENR12345' })
  @IsString()
  @IsOptional()
  enrollmentNumber?: string;

  @ApiProperty({ required: false, example: 'url/to/birthCertificate/document' })
  @IsString()
  @IsOptional()
  birthCertificateDocument?: string;

  @ApiProperty({ required: false, example: 'TC12345' })
  @IsString()
  @IsOptional()
  tcNumber?: string;

  @ApiProperty({ required: false, example: 'url/to/tcDocument/document' })
  @IsString()
  @IsOptional()
  tcDocument?: string;

  @ApiProperty({ required: false, example: 'classId' })
  @IsString()
  @IsOptional()
  classId?: string;

  @ApiProperty({ required: false, type: ParentsDetailsDto })
  @ValidateNested()
  @Type(() => ParentsDetailsDto)
  @IsOptional()
  parentsDetails?: ParentsDetailsDto;
}


