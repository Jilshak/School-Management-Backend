import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsString()
  readonly password: string;
}