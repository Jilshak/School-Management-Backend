import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNoticeDto {
  @ApiProperty({ description: 'The title of the notice' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'The content of the notice' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'The expiration date of the notice', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}