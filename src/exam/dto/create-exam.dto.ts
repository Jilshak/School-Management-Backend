import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsEnum, IsOptional, IsArray, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

export enum ExamType {
  ONLINE = 'online',
  OFFLINE = 'offline'
}

export class ExamDto{

  @ApiProperty({ description: 'The subject ID of the exam' })
  @IsNotEmpty()
  @IsString()
  subjectId: string;

  @ApiProperty({ description: 'The out of marks of the exam' })
  @IsNotEmpty()
  @IsNumber()
  outOf: number;

  @ApiProperty({ description: 'The date of the exam' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @ApiProperty({ description: 'Total mark of the exam' })
  @IsNotEmpty()
  @IsNumber()
  totalMark:number;


  @ApiProperty({ description: 'Exam Starting time' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({ description: 'Exam Ending time' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @ApiProperty({ description: 'Descriptin for exam' })
  @IsOptional()
  @IsString()
  description: Date;
}

export class CreateSemExamDto {
  @ApiProperty({ description: 'The name of the exam' })
  @IsNotEmpty()
  @IsArray()
  exam: ExamDto[];

  @ApiProperty({ description: 'The name of the exam' })
  @IsNotEmpty()
  @IsMongoId()
  @Type(()=>Types.ObjectId)
  classId: string;
}

export class CreateClassTest {
  @ApiProperty({ description: 'exam date' })
  @IsNotEmpty()
  @IsDate()
  @Type(()=>Date)
  date: Date

  @ApiProperty({ description: 'id of the subject' })
  @IsNotEmpty()
  @IsMongoId()
  @Type(()=>Types.ObjectId)
  subjectId: Types.ObjectId

  @ApiProperty({ description: 'Total mark of the exam' })
  @IsNotEmpty()
  @IsNumber()
  totalMark:number;

  
  @ApiProperty({ description: 'ClassId' })
  @IsNotEmpty()
  @IsMongoId()
  @Type(()=>Types.ObjectId)
  classId: Types.ObjectId

  @ApiProperty({ description: 'Array of period IDs', type: [Types.ObjectId] })
  @IsNotEmpty()
  @IsArray()
  @IsMongoId({ each: true })
  @Type(() => Types.ObjectId)
  periods: Types.ObjectId[]

  @ApiProperty({ description: 'Description of the class test' })
  @IsOptional()
  @IsString()
  description?: string
 
}