import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ description: 'The name of the class' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The ID of the school this class belongs to' })
  @IsNotEmpty()
  @IsString()
  schoolId: string;
}