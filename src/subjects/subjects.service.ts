import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Subject } from 'src/domains/schema/subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdSubject = new this.subjectModel(createSubjectDto);
      const result = await createdSubject.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create subject');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Subject[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const subjects = await this.subjectModel.find().session(session).exec();
      await session.commitTransaction();
      return subjects;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch subjects');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Subject> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const subject = await this.subjectModel.findById(id).session(session).exec();
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      await session.commitTransaction();
      return subject;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch subject');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedSubject = await this.subjectModel.findByIdAndUpdate(id, updateSubjectDto, { new: true, session }).exec();
      if (!updatedSubject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedSubject;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update subject');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.subjectModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove subject');
    } finally {
      session.endSession();
    }
  }
}