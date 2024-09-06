import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateClassroomDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsString()
  description?: string;
}