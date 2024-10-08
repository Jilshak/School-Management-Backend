import { Controller, Post, Body, UnauthorizedException, UseInterceptors, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.', content: { 'application/json': { schema: { properties: { token: { type: 'string' } } } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ type: SignInDto })
  async login(@Body() loginDto: { username: string; password: string }) {
    console.log(loginDto);
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    console.log(user);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  
  

  @Post('store-fcm-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles()
  @ApiOperation({ summary: 'Update FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiBody({ schema: { properties: { fcmToken: { type: 'string' } } } })
  async updateFcmToken(@Body('fcmToken') token: string, @LoginUser("userId") userId: Types.ObjectId) {
    try {
      await this.authService.updateFcmToken(userId, token);
      return { message: 'FCM token updated successfully.' };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Failed to update FCM token');
    }
  }
}
