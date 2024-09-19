import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ description: 'The name of the subject' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The code of the subject' })
  @IsNotEmpty()
  @IsString()
  code: string;
}