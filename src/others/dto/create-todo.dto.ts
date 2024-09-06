import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTodoDto {
  @ApiProperty({ description: 'The title of the todo' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The description of the todo', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The completion status of the todo', default: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ description: 'The due date of the todo', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dueDate?: Date;
}