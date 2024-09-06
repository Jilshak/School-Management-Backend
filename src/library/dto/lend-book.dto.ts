import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LendBookDto {
  @ApiProperty({ description: 'The ID of the book to be lent' })
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @ApiProperty({ description: 'The ID of the user borrowing the book' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}