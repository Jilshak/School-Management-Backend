import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class signUpDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;

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
}
