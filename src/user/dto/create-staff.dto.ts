import { IsNotEmpty, IsString, IsEmail, IsDate, IsOptional } from 'class-validator';

export class CreateStaffDto {
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
  position: string;

  @IsOptional()
  @IsString()
  department: string;

  @IsOptional()
  @IsString()
  qualification: string;
}