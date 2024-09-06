import { IsNotEmpty, IsMongoId, IsNumber, Min, Max } from 'class-validator';

export class CreateResultDto {
  @IsNotEmpty()
  @IsMongoId()
  examId: string;

  @IsNotEmpty()
  @IsMongoId()
  studentId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsNotEmpty()
  @IsMongoId()
  gradedBy: string; // Teacher/Employee ID
}