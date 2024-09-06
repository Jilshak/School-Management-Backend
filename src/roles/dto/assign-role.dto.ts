import { IsNotEmpty, IsMongoId } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  roleId: string;
}