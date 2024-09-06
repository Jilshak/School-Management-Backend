import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';

export class CreateResultDto {
  @ApiProperty({ description: 'The ID of the student' })
  @IsNotEmpty()
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'The ID of the exam' })
  @IsNotEmpty()
  @IsString()
  examId: string;

  @ApiProperty({ description: 'The score obtained by the student', minimum: 0, maximum: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ description: 'Any remarks about the result' })
  @IsString()
  remarks: string;
}