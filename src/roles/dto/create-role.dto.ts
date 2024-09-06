import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the role', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'List of permissions for the role', type: [String] })
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}