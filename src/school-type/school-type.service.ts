import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { SchoolType, SchoolTypeDocument } from '../domains/schema/school-type.schema';
import { CreateSchoolTypeDto } from './dto/create-school-type.dto';
import { UpdateSchoolTypeDto } from './dto/update-school-type.dto';

@Injectable()
export class SchoolTypeService {
  constructor(
    @InjectModel(SchoolType.name) private schoolTypeModel: Model<SchoolTypeDocument>,
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

  async create(createSchoolTypeDto: CreateSchoolTypeDto): Promise<SchoolType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSchoolType = new this.schoolTypeModel(createSchoolTypeDto);
      const result = await createdSchoolType.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create school type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<SchoolType[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const schoolTypes = await this.schoolTypeModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return schoolTypes;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch school types');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<SchoolType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const schoolType = await this.schoolTypeModel.findById(id).session(session).exec();
      if (!schoolType) {
        throw new NotFoundException(`School type with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return schoolType;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch school type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateSchoolTypeDto: UpdateSchoolTypeDto): Promise<SchoolType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedSchoolType = await this.schoolTypeModel.findByIdAndUpdate(
        id,
        updateSchoolTypeDto,
        { new: true, session }
      ).exec();

      if (!updatedSchoolType) {
        throw new NotFoundException(`School type with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedSchoolType;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update school type');
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

      const result = await this.schoolTypeModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`School type with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove school type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}