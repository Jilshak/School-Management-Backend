import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Class } from 'src/domains/schema/classes.schema';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createClassDto: CreateClassDto): Promise<Class> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdClass = new this.classModel(createClassDto);
      const result = await createdClass.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create class');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Class[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const classes = await this.classModel.find().session(session).exec();
      await session.commitTransaction();
      return classes;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch classes');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Class> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const classData = await this.classModel.findById(id).session(session).exec();
      if (!classData) {
        throw new NotFoundException(`Class with ID ${id} not found`);
      }
      await session.commitTransaction();
      return classData;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch class');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedClass = await this.classModel.findByIdAndUpdate(id, updateClassDto, { new: true, session }).exec();
      if (!updatedClass) {
        throw new NotFoundException(`Class with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedClass;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update class');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.classModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Class with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove class');
    } finally {
      session.endSession();
    }
  }
}