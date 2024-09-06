import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Exam, ExamDocument } from '../domains/schema/exam.schema';
import { ExamTimeTable, ExamTimeTableDocument } from '../domains/schema/exam-time-table.schema';
import { Result, ResultDocument } from '../domains/schema/result.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { CreateOnlineExamDto } from './dto/create-online-exam.dto';
import { CreateOfflineExamDto } from './dto/create-offline-exam.dto';
import { CreateExamTimeTableDto } from './dto/create-exam-time-table.dto';
import { CreateResultDto } from './dto/create-result.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamTimeTable.name) private examTimeTableModel: Model<ExamTimeTableDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdExam = new this.examModel(createExamDto);
      const result = await createdExam.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create exam');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Exam[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const exams = await this.examModel.find().session(session).exec();
      await session.commitTransaction();
      return exams;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch exams');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const exam = await this.examModel.findById(id).session(session).exec();
      if (!exam) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return exam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exam');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedExam = await this.examModel.findByIdAndUpdate(id, updateExamDto, { new: true, session }).exec();
      if (!updatedExam) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedExam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update exam');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.examModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Exam with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove exam');
    } finally {
      session.endSession();
    }
  }

  // Online Exams
  async createOnlineExam(createOnlineExamDto: CreateOnlineExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdExam = new this.examModel({ ...createOnlineExamDto, type: 'online' });
      const result = await createdExam.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create online exam');
    } finally {
      session.endSession();
    }
  }

  async findAllOnlineExams(): Promise<Exam[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const onlineExams = await this.examModel.find({ type: 'online' }).session(session).exec();
      await session.commitTransaction();
      return onlineExams;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch online exams');
    } finally {
      session.endSession();
    }
  }

  async findOneOnlineExam(id: string): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const onlineExam = await this.examModel.findOne({ _id: id, type: 'online' }).session(session).exec();
      if (!onlineExam) {
        throw new NotFoundException(`Online exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return onlineExam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch online exam');
    } finally {
      session.endSession();
    }
  }

  async updateOnlineExam(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedOnlineExam = await this.examModel.findOneAndUpdate(
        { _id: id, type: 'online' },
        updateExamDto,
        { new: true, session }
      ).exec();
      if (!updatedOnlineExam) {
        throw new NotFoundException(`Online exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedOnlineExam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update online exam');
    } finally {
      session.endSession();
    }
  }

  async removeOnlineExam(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.examModel.findOneAndDelete({ _id: id, type: 'online' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Online exam with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove online exam');
    } finally {
      session.endSession();
    }
  }

  // Offline Exams
  async createOfflineExam(createOfflineExamDto: CreateOfflineExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdExam = new this.examModel({ ...createOfflineExamDto, type: 'offline' });
      const result = await createdExam.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create offline exam');
    } finally {
      session.endSession();
    }
  }

  async findAllOfflineExams(): Promise<Exam[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const offlineExams = await this.examModel.find({ type: 'offline' }).session(session).exec();
      await session.commitTransaction();
      return offlineExams;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch offline exams');
    } finally {
      session.endSession();
    }
  }

  async findOneOfflineExam(id: string): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const offlineExam = await this.examModel.findOne({ _id: id, type: 'offline' }).session(session).exec();
      if (!offlineExam) {
        throw new NotFoundException(`Offline exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return offlineExam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch offline exam');
    } finally {
      session.endSession();
    }
  }

  async updateOfflineExam(id: string, updateExamDto: UpdateExamDto): Promise<Exam> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedOfflineExam = await this.examModel.findOneAndUpdate(
        { _id: id, type: 'offline' },
        updateExamDto,
        { new: true, session }
      ).exec();
      if (!updatedOfflineExam) {
        throw new NotFoundException(`Offline exam with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedOfflineExam;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update offline exam');
    } finally {
      session.endSession();
    }
  }

  async removeOfflineExam(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.examModel.findOneAndDelete({ _id: id, type: 'offline' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Offline exam with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove offline exam');
    } finally {
      session.endSession();
    }
  }

  // Exam Time Table
  async createExamTimeTable(createExamTimeTableDto: CreateExamTimeTableDto): Promise<ExamTimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdExamTimeTable = new this.examTimeTableModel(createExamTimeTableDto);
      const result = await createdExamTimeTable.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create exam time table');
    } finally {
      session.endSession();
    }
  }

  async findAllExamTimeTables(): Promise<ExamTimeTable[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const examTimeTables = await this.examTimeTableModel.find().session(session).exec();
      await session.commitTransaction();
      return examTimeTables;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch exam time tables');
    } finally {
      session.endSession();
    }
  }

  async findOneExamTimeTable(id: string): Promise<ExamTimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const examTimeTable = await this.examTimeTableModel.findById(id).session(session).exec();
      if (!examTimeTable) {
        throw new NotFoundException(`Exam time table with ID ${id} not found`);
      }
      await session.commitTransaction();
      return examTimeTable;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch exam time table');
    } finally {
      session.endSession();
    }
  }

  async updateExamTimeTable(id: string, updateExamTimeTableDto: CreateExamTimeTableDto): Promise<ExamTimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedExamTimeTable = await this.examTimeTableModel.findByIdAndUpdate(
        id,
        updateExamTimeTableDto,
        { new: true, session }
      ).exec();
      if (!updatedExamTimeTable) {
        throw new NotFoundException(`Exam time table with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedExamTimeTable;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update exam time table');
    } finally {
      session.endSession();
    }
  }

  async removeExamTimeTable(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.examTimeTableModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Exam time table with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove exam time table');
    } finally {
      session.endSession();
    }
  }

  // Result
  async createResult(createResultDto: CreateResultDto): Promise<Result> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdResult = new this.resultModel(createResultDto);
      const result = await createdResult.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create result');
    } finally {
      session.endSession();
    }
  }

  async findAllResults(): Promise<Result[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const results = await this.resultModel.find().session(session).exec();
      await session.commitTransaction();
      return results;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch results');
    } finally {
      session.endSession();
    }
  }

  async findOneResult(id: string): Promise<Result> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.resultModel.findById(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Result with ID ${id} not found`);
      }
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch result');
    } finally {
      session.endSession();
    }
  }

  async updateResult(id: string, updateResultDto: CreateResultDto): Promise<Result> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedResult = await this.resultModel.findByIdAndUpdate(
        id,
        updateResultDto,
        { new: true, session }
      ).exec();
      if (!updatedResult) {
        throw new NotFoundException(`Result with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedResult;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update result');
    } finally {
      session.endSession();
    }
  }

  async removeResult(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.resultModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Result with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove result');
    } finally {
      session.endSession();
    }
  }

  // GradeBook
  async getGradeBook(studentId: string): Promise<any> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const results = await this.resultModel.find({ studentId }).session(session).exec();
      const exams = await this.examModel.find({ _id: { $in: results.map(r => r.examId) } }).session(session).exec();
      
      const gradeBook = results.map(result => {
        const exam = exams.find(e => e._id.toString() === result.examId.toString());
        return {
          examName: exam.name,
          subject: exam.subjectId,
          score: result.score,
          grade: result.grade,
          date: exam.date
        };
      });

      await session.commitTransaction();
      return gradeBook;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch grade book');
    } finally {
      session.endSession();
    }
  }
}