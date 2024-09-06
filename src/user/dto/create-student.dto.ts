import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({ description: 'The first name of the student' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'The last name of the student' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'The date of birth of the student' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ description: 'The grade or class of the student' })
  @IsNotEmpty()
  @IsString()
  grade: string;

  @ApiProperty({ description: 'The parent or guardian contact information', required: false })
  @IsOptional()
  @IsString()
  parentContact?: string;
}