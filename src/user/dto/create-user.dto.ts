import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'The email of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: 'The role of the user', required: false })
  @IsOptional()
  @IsString()
  role?: string;
}