import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, Schema as MongooseSchema } from 'mongoose';
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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdRole = new this.roleModel(createRoleDto);
      const result = await createdRole.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Role[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const roles = await this.roleModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return roles;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch roles');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<Role> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const role = await this.roleModel.findById(id).session(session).exec();
      if (!role) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return role;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedRole = await this.roleModel.findByIdAndUpdate(id, updateRoleDto, { new: true, session }).exec();
      if (!updatedRole) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedRole;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async remove(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.roleModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Role with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createPermission(createPermissionDto: CreatePermissionDto): Promise<Role> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

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

      if (session) {
        await session.commitTransaction();
      }
      return updatedRole;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create permission');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getPermissions(roleId: string): Promise<string[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const role = await this.roleModel.findById(roleId).session(session);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return role.permissions;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get permissions');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const { userId, roleId } = assignRoleDto;

      const user = await this.userModel.findById(userId).session(session);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const role = await this.roleModel.findById(roleId).session(session);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      user.roleId = new MongooseSchema.Types.ObjectId(roleId);
      const updatedUser = await user.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return updatedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to assign role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const user = await this.userModel.findById(userId).session(session);
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const role = await this.roleModel.findById(roleId).session(session);
      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      user.roleId = new MongooseSchema.Types.ObjectId(roleId);
      const updatedUser = await user.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return updatedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to assign role');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}