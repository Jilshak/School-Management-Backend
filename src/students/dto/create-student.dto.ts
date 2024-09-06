import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStudentDto {
  @ApiProperty({ description: 'The name of the student' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email of the student' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The date of birth of the student' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @ApiProperty({ description: 'The class of the student' })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({ description: 'The name of the student\'s parent', required: false })
  @IsOptional()
  @IsString()
  parentName?: string;

  @ApiProperty({ description: 'The address of the student', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}