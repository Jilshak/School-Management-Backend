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

  async create(createSchoolTypeDto: CreateSchoolTypeDto): Promise<SchoolType> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdSchoolType = new this.schoolTypeModel(createSchoolTypeDto);
      const result = await createdSchoolType.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create school type');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<SchoolType[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const schoolTypes = await this.schoolTypeModel.find().session(session).exec();
      await session.commitTransaction();
      return schoolTypes;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch school types');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<SchoolType> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const schoolType = await this.schoolTypeModel.findById(id).session(session).exec();
      if (!schoolType) {
        throw new NotFoundException(`School type with ID ${id} not found`);
      }
      await session.commitTransaction();
      return schoolType;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch school type');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateSchoolTypeDto: UpdateSchoolTypeDto): Promise<SchoolType> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedSchoolType = await this.schoolTypeModel.findByIdAndUpdate(
        id,
        updateSchoolTypeDto,
        { new: true, session }
      ).exec();

      if (!updatedSchoolType) {
        throw new NotFoundException(`School type with ID ${id} not found`);
      }

      await session.commitTransaction();
      return updatedSchoolType;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update school type');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.schoolTypeModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`School type with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove school type');
    } finally {
      session.endSession();
    }
  }
}