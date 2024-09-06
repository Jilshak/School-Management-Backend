import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { CreateExamDto } from './create-exam.dto';

export class CreateOfflineExamDto extends CreateExamDto {
  @ApiProperty({ description: 'The venue for the offline exam' })
  @IsNotEmpty()
  @IsString()
  venue: string;

  @ApiProperty({ description: 'Additional instructions for the offline exam' })
  @IsNotEmpty()
  @IsString()
  instructions: string;
}