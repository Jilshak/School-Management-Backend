import { IsNotEmpty, IsString, IsUrl, IsOptional } from 'class-validator';
import { CreateExamDto } from './create-exam.dto';

export class CreateOnlineExamDto extends CreateExamDto {
  @IsNotEmpty()
  @IsUrl()
  examLink: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}