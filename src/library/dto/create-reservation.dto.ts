import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @ApiProperty({ description: 'The ID of the book to be reserved' })
  @IsNotEmpty()
  @IsString()
  bookId: string;

  @ApiProperty({ description: 'The ID of the user making the reservation' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The date of the reservation' })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  reservationDate: Date;
}