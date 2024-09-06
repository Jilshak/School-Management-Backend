import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ description: 'The name of the section' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The ID of the class this section belongs to' })
  @IsNotEmpty()
  @IsString()
  classId: string;

  @ApiProperty({ description: 'The ID of the school this section belongs to' })
  @IsNotEmpty()
  @IsString()
  schoolId: string;
}