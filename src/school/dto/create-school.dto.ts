import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty({ description: 'The name of the school' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The address of the school' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'The phone number of the school', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'The email address of the school', required: false })
  @IsOptional()
  @IsString()
  email?: string;
}