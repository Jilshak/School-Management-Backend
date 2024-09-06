import { IsNotEmpty, IsString, IsEmail, IsDate, IsOptional } from 'class-validator';

export class CreateAdmissionDto {
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
  appliedClass: string;

  @IsOptional()
  @IsString()
  parentName: string;

  @IsOptional()
  @IsString()
  previousSchool: string;

  @IsOptional()
  @IsString()
  status: string;
}