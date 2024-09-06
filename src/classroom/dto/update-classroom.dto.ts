import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateClassroomDto {
  @ApiPropertyOptional({ description: 'The updated name of the classroom' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'The updated capacity of the classroom' })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({ description: 'The updated building where the classroom is located' })
  @IsOptional()
  @IsString()
  building?: string;

  @ApiPropertyOptional({ description: 'The updated room number of the classroom' })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Updated additional equipment in the classroom' })
  @IsOptional()
  @IsString()
  equipment?: string;
}