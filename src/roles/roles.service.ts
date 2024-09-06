import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Role } from 'src/domains/schema/roles.schema';
import { User } from 'src/domains/schema/user.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdRole = new this.roleModel(createRoleDto);
      const result = await createdRole.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create role');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Role[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const roles = await this.roleModel.find().session(session).exec();
      await session.commitTransaction();
      return roles;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch roles');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Role> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const role = await this.roleModel.findById(id).session(session).exec();
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      await session.commitTransaction();
      return role;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch role');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedRole = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true, session }).exec();
      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedRole;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update role');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.roleModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove role');
    } finally {
      session.endSession();
    }
  }

  // Role Permissions
  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Role> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { roleId, permission } = createPermissionDto;
      const role = await this.roleModel.findById(roleId).session(session);

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      if (role.permissions.includes(permission)) {
        throw new BadRequestException(`Permission ${permission} already exists for this role`);
      }

      role.permissions.push(permission);
      const updatedRole = await role.save({ session });

      await session.commitTransaction();
      return updatedRole;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create permission');
    } finally {
      session.endSession();
    }
  }

  async getPermissions(roleId: string): Promise<string[]> {
    try {
      const role = await this.roleModel.findById(roleId);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }
      return role.permissions;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get permissions');
    }
  }

  // Assign Role
  async assignRole(assignRoleDto: AssignRoleDto): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const { userId, roleId } = assignRoleDto;
      const user = await this.userModel.findById(userId).session(session);
      const role = await this.roleModel.findById(roleId).session(session);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      user.roleId = roleId;
      const updatedUser = await user.save({ session });

      await session.commitTransaction();
      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to assign role');
    } finally {
      session.endSession();
    }
  }
}