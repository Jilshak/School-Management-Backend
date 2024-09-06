import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '../domains/schema/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created.', type: User })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 200, description: 'User successfully signed in.', schema: {
    properties: {
      access_token: { type: 'string' }
    }
  }})
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: SignInDto })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'Return the user profile.', type: User })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Req() req) {
    return req.user;
  }
}
