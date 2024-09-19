import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, IsArray, ArrayMinSize, IsDate, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class AcademicYearDto {
  @ApiProperty({ description: 'The start date of the academic year' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'The end date of the academic year' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class CreateClassroomDto {
  @ApiProperty({ description: 'The name of the classroom' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The ID of the class teacher', required: false })
  @IsMongoId()
  @IsOptional()
  classTeacherId?: string;

  @ApiProperty({ description: 'An array of subject IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  subjects: string[];

  @ApiProperty({ description: 'The academic year of the classroom' })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AcademicYearDto)
  academicYear: AcademicYearDto;
}