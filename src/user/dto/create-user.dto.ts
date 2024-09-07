import { IsEmail, IsString, Matches, MinLength, IsBoolean, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../auth/enums/auth.enums';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'The email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'Pass123!', 
    description: 'The password for the user account. Must include uppercase, lowercase, number, and special character.' 
  })
  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;

  @ApiProperty({ example: true, description: 'Whether the user account is active' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ example: '5f8d0d55d3f6c346c4a92dfa', description: 'The ID of the school the user belongs to' })
  @IsMongoId()
  schoolId: string;

  @ApiProperty({ example: '5f8d0d55d3f6c346c4a92dfb', description: 'The ID of the role assigned to the user' })
  @IsMongoId()
  roleId: string;

  @ApiProperty({ enum: ['student', 'teacher', 'admin'], description: 'The type of user' })
  @IsEnum(['student', 'teacher', 'admin'])
  userType: string;

  @ApiProperty({ enum: UserRole, description: 'The role of the user' })
  @IsEnum(UserRole)
  role: UserRole;
}