import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateSemExamDto } from './create-exam.dto';

export class CreateOfflineExamDto extends CreateSemExamDto {
  @ApiProperty({ description: 'The venue for the offline exam' })
  @IsNotEmpty()
  @IsString()
  venue: string;

  @ApiProperty({ description: 'Additional instructions for the offline exam' })
  @IsNotEmpty()
  @IsString()
  instructions: string;
}