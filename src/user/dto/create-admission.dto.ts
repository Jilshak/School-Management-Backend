import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdmissionDto {
  @ApiProperty({ description: 'The first name of the applicant' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the applicant' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The date of birth of the applicant' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ description: 'The grade or class applied for' })
  @IsNotEmpty()
  @IsString()
  gradeApplied: string;

  @ApiProperty({ description: 'The previous school of the applicant', required: false })
  @IsOptional()
  @IsString()
  previousSchool?: string;

  @ApiProperty({ description: 'The parent or guardian contact information' })
  @IsNotEmpty()
  @IsString()
  parentContact: string;

  @ApiProperty({ description: 'The application status', required: false })
  @IsOptional()
  @IsString()
  status?: string;
}