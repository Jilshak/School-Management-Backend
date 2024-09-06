import { IsNotEmpty, IsString, IsEmail, IsDate, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsDate()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsString()
  class: string;

  @IsOptional()
  @IsString()
  parentName: string;

  @IsOptional()
  @IsString()
  address: string;
}