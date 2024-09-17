import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/domains/schema/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectModel(User.name) private userModel:Model<User>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!roles) {
      return true;
    }
    const userDetail = await this.userModel.findById(request.user.sub)
    const loginUser = {
      userId: userDetail._id,
      username: userDetail.username,
      roles: userDetail.roles,
      schoolId: userDetail.schoolId
    };
    request.user = loginUser
    return this.matchRoles(roles, loginUser.roles);
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private matchRoles(allowedRoles: string[], userRoles: string[]): boolean {
    return allowedRoles.length === 0 || allowedRoles.some(role => userRoles.includes(role));
  }
}