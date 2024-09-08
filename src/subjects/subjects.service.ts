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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createSubjectDto: CreateSubjectDto,schoolId:string): Promise<Subject> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSubject = new this.subjectModel({...createSubjectDto,schoolId});
      const result = await createdSubject.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create subject');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(schoolId:string): Promise<Subject[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const subjects = await this.subjectModel.find({schoolId}).session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return subjects;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch subjects');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<Subject> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const subject = await this.subjectModel.findById(id).session(session).exec();
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return subject;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch subject');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<Subject> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedSubject = await this.subjectModel.findByIdAndUpdate(id, updateSubjectDto, { new: true, session }).exec();
      if (!updatedSubject) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedSubject;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update subject');
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

      const result = await this.subjectModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Subject with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove subject');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}