import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdmissionDto {
  @ApiProperty({ description: 'The name of the student' })
  @IsNotEmpty()
  @IsString()
  studentName: string;

  @ApiProperty({ description: 'The date of admission' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  admissionDate: Date;

  @ApiProperty({ description: 'The class for admission' })
  @IsNotEmpty()
  @IsString()
  class: string;

  @ApiProperty({ description: 'Any additional remarks', required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}