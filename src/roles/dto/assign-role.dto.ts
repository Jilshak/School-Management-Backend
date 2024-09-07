import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ description: 'The ID of the user' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'The ID of the role to assign' })
  @IsMongoId()
  roleId: string;
}