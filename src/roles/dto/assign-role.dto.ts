import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'The ID of the user to assign the role to' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'The ID of the role to be assigned' })
  @IsNotEmpty()
  @IsString()
  roleId: string;
}