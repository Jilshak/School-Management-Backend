import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTravelDto {
  @ApiProperty({ description: 'The destination of the travel' })
  @IsNotEmpty()
  @IsString()
  destination: string;

  @ApiProperty({ description: 'The start date of the travel' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'The end date of the travel' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'The purpose of the travel', required: false })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiProperty({ description: 'The mode of transportation', required: false })
  @IsOptional()
  @IsString()
  transportation?: string;
}