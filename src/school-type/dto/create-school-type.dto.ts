import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSchoolTypeDto {
  @ApiProperty({ description: 'The name of the school type', required: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The code of the school type', required: true })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'The description of the school type', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}