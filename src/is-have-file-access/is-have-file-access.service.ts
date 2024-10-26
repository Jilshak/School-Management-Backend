import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { User } from 'src/domains/schema/user.schema';

@Injectable()
export class IsHaveFileAccessService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async checkWriteAccess(
    userId: Types.ObjectId,
    schoolId: Types.ObjectId,
    fileLocation: string,
    details: any,
  ) {
    const splitFileLocation = fileLocation.split('/');
    if (
      splitFileLocation[1] === 'users' &&
      (details.roles.includes(UserRole.SUPERADMIN) ||
        details.roles.includes(UserRole.ADMIN) ||
        details.roles.includes(UserRole.ADMISSION_TEAM) ||
        details.roles.includes(UserRole.HR))
    ) {
      return schoolId;
    } else if (
      (splitFileLocation[1] === 'syllabus' &&
        details.roles.includes(UserRole.SUPERADMIN)) ||
      details.roles.includes(UserRole.ADMIN)
    ) {
      return schoolId;
    }
    // If the user doesn't have the required role, return null or false
    return false;
  }

  async checkReadAccess(
    userId: Types.ObjectId,
    schoolId: Types.ObjectId,
    fileLocation: string,
    details: any,
  ) {
    const splitFileLocation = fileLocation.split('/');
    if (splitFileLocation[1] !== schoolId.toString()) {
        return false
    }
    if (splitFileLocation[2] === 'users') {
      if (details.roles.includes(UserRole.STUDENT)) {
        return userId.toString() === splitFileLocation[3];
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
