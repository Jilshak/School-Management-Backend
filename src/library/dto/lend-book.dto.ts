import { IsNotEmpty, IsMongoId } from 'class-validator';

export class LendBookDto {
  @IsNotEmpty()
  @IsMongoId()
  bookId: string;

  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}