import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFineDto {
  @ApiProperty({ description: 'The ID of the user who incurred the fine' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The ID of the book associated with the fine' })
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @ApiProperty({ description: 'The amount of the fine' })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'The reason for the fine' })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({ description: 'The date the fine was issued' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
}