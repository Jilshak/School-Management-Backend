import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'The name of the subject' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The code of the subject' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'The description of the subject', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The ID of the classroom this subject belongs to' })
  @IsNotEmpty()
  @IsString()
  classroomId: string;
}