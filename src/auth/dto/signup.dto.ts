import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  readonly name: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}