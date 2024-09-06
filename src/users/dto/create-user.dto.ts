import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'The email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password for the user account' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'The full name of the user', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;
}