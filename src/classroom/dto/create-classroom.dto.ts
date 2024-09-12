import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId, IsArray, ArrayMinSize } from 'class-validator';
import { Types } from 'mongoose';

export class CreateClassroomDto {
  @ApiProperty({ description: 'The name of the classroom' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The ID of the class teacher' })
  @IsNotEmpty()
  @IsMongoId()
  classTeacherId: string;

  @ApiProperty({ description: 'An array of subject IDs', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsMongoId({ each: true })
  subjects: string[];

  @ApiProperty({ description: 'The academic year of the classroom' })
  @IsNotEmpty()
  @IsString()
  academicYear: string;
}