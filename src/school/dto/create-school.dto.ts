import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsUrl,
  IsMongoId,
} from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ description: 'The name of the school', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The state where the school is located', required: true })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ description: 'The district where the school is located', required: true })
  @IsNotEmpty()
  @IsString()
  district: string;

  @ApiProperty({
    description: 'The detailed address of the school',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The unique school code', required: true })
  @IsNotEmpty()
  @IsString()
  schoolCode: string;

  @ApiProperty({
    description: 'The email address of the school',
    required: true,
  })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ 
    description: 'The ID of the school type',
    required: true
  })
  @IsNotEmpty()
  @IsMongoId()
  schoolTypeId: string;

  @ApiProperty({
    description: 'The primary phone number of the school',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  primaryPhone: string;

  @ApiProperty({
    description: 'The secondary phone number of the school',
    required: false,
  })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @ApiProperty({ description: 'The department of the school', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'The URL of the school logo', required: true })
  @IsOptional()
  @IsUrl()
  schoolLogo?: string;

  @ApiProperty({
    description: 'The number of students in the school',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfStudents: number;

  @ApiProperty({
    description: 'The number of staff members in the school',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  numberOfStaff: number;
}
