import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty()
  @IsMongoId()
  roleId: string;

  @IsNotEmpty()
  @IsString()
  permission: string;
}