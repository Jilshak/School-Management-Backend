import { IsNotEmpty, IsNumber, IsMongoId, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateResultDto {
  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  studentId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  examId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  @Type(() => Types.ObjectId)
  subjectId: Types.ObjectId;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;
}