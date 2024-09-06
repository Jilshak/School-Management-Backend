import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ description: 'The ID of the role to add the permission to' })
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({ description: 'The permission to be added' })
  @IsString()
  @IsNotEmpty()
  permission: string;
}