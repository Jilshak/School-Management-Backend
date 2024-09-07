import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Exam } from '../domains/schema/exam.schema';
import { ExamTimeTable } from '../domains/schema/exam-time-table.schema';
import { Result } from '../domains/schema/result.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateOnlineExamDto } from './dto/create-online-exam.dto';
import { CreateOfflineExamDto } from './dto/create-offline-exam.dto';
import { CreateExamTimeTableDto } from './dto/create-exam-time-table.dto';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<Exam>,
    @InjectModel(ExamTimeTable.name) private examTimeTableModel: Model<ExamTimeTable>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
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

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdExam = new this.examModel(createExamDto);
      const result = await createdExam.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create exam');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createOnlineExam(createOnlineExamDto: CreateOnlineExamDto): Promise<Exam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdOnlineExam = new this.examModel({ ...createOnlineExamDto, type: 'online' });
      const result = await createdOnlineExam.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create online exam');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createOfflineExam(createOfflineExamDto: CreateOfflineExamDto): Promise<Exam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdOfflineExam = new this.examModel({ ...createOfflineExamDto, type: 'offline' });
      const result = await createdOfflineExam.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create offline exam');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createExamTimeTable(createExamTimeTableDto: CreateExamTimeTableDto): Promise<ExamTimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdExamTimeTable = new this.examTimeTableModel(createExamTimeTableDto);
      const result = await createdExamTimeTable.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create exam time table');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createResult(createResultDto: CreateResultDto): Promise<Result> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdResult = new this.resultModel(createResultDto);
      const result = await createdResult.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create result');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Exam[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const exams = await this.examModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return exams;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch exams');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<Exam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const exam = await this.examModel.findById(id).session(session).exec();
      if (!exam) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return exam;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exam');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedExam = await this.examModel.findByIdAndUpdate(id, updateExamDto, { new: true, session }).exec();
      if (!updatedExam) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedExam;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update exam');
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

    const result = await this.examModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Exam with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to delete exam');
    }
  }
}