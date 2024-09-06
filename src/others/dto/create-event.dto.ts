import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @ApiProperty({ description: 'The title of the event' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the event' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ description: 'The start date of the event' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ description: 'The end date of the event' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({ description: 'The location of the event', required: false })
  @IsOptional()
  @IsString()
  location?: string;
}
