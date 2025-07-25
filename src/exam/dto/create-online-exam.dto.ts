import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { CreateSemExamDto } from './create-exam.dto';

export class CreateOnlineExamDto extends CreateSemExamDto {
  @ApiProperty({ description: 'The URL for the online exam' })
  @IsNotEmpty()
  @IsUrl()
  examUrl: string;

  @ApiProperty({ description: 'Instructions for the online exam', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}