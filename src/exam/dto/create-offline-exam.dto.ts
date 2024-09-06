import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { CreateExamDto } from './create-exam.dto';

export class CreateOfflineExamDto extends CreateExamDto {
  @IsNotEmpty()
  @IsString()
  venue: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}