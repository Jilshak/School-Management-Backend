import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ description: 'The name of the classroom' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'The capacity of the classroom' })
  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'The building where the classroom is located' })
  @IsNotEmpty()
  @IsString()
  building: string;

  @ApiProperty({ description: 'The room number of the classroom' })
  @IsNotEmpty()
  @IsString()
  roomNumber: string;

  @ApiProperty({ description: 'Additional equipment in the classroom', required: false })
  @IsOptional()
  @IsString()
  equipment?: string;
}