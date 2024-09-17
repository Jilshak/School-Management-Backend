import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ example: 'john@example.com', description: 'The email of the user' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Pass123!', description: 'The password for the user account' })
  @IsString()
  password: string;
}