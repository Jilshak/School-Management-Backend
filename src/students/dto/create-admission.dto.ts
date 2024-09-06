import { IsNotEmpty, IsString, IsDate, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

enum AdmissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export class CreateAdmissionDto {
  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  @IsMongoId()
  classId: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  admissionDate: Date;

  @IsNotEmpty()
  @IsEnum(AdmissionStatus)
  status: AdmissionStatus;

  @IsNotEmpty()
  @IsString()
  previousSchool: string;

  @IsNotEmpty()
  @IsString()
  previousGrade: string;
}