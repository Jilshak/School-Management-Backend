import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Connection } from 'mongoose';
import { WorkDoneBook } from '../domains/schema/workdonebook.schema';
import { ClassDailyRecord } from '../domains/schema/classDailyRecord.schema';
import { CreateWorkDoneBookDto } from './dto/create-workdonebook.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class WorkDoneBookService {
  constructor(
    @InjectModel(WorkDoneBook.name) private workDoneBookModel: Model<WorkDoneBook>,
    @InjectModel(ClassDailyRecord.name) private classDailyRecordModel: Model<ClassDailyRecord>,
    @InjectConnection() private connection: Connection,
  ) {}

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async upsert(createWorkDoneBookDtos: CreateWorkDoneBookDto[], teacherId: Types.ObjectId, schoolId: Types.ObjectId) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      if (createWorkDoneBookDtos.length === 0) {
        throw new BadRequestException('No entries provided');
      }

      const flattenedDtos = Array.isArray(createWorkDoneBookDtos[0]) 
        ? createWorkDoneBookDtos[0] 
        : createWorkDoneBookDtos;

      if (flattenedDtos.length === 0) {
        throw new BadRequestException('No valid entries provided after flattening');
      }

      const date = new Date(flattenedDtos[0].date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      // Update WorkDoneBook
      const workDoneBookFilter = {
        date: date,
        teacherId: teacherId,
        schoolId: schoolId,
      };

      const workDoneBookUpdate = {
        $set: {
          date: date,
          teacherId: teacherId,
          schoolId: schoolId,
          entries: flattenedDtos.map(dto => ({
            classroomId: new Types.ObjectId(dto.classroomId),
            subjectId: new Types.ObjectId(dto.subjectId),
            topics: dto.topics,
            activities: dto.activities,
            homework: dto.homework,
          })),
        }
      };

      const workDoneBookOptions = { upsert: true, new: true, session };

      const workDoneBookResult = await this.workDoneBookModel.findOneAndUpdate(workDoneBookFilter, workDoneBookUpdate, workDoneBookOptions);

      // Update ClassDailyRecord for each classroom
      for (const dto of flattenedDtos) {
        const classDailyRecordFilter = {
          date: date,
          classroomId: new Types.ObjectId(dto.classroomId),
          schoolId: schoolId,
        };

        const classDailyRecordUpdate = {
          $addToSet: {
            entries: {
              teacherId: new Types.ObjectId(teacherId),
              subjectId: new Types.ObjectId(dto.subjectId),
              topics: dto.topics,
              activities: dto.activities,
              homework: dto.homework,
            },
          },
        };

        const classDailyRecordOptions = { upsert: true, new: true, session };

        await this.classDailyRecordModel.findOneAndUpdate(classDailyRecordFilter, classDailyRecordUpdate, classDailyRecordOptions);
      }

      if (supportsTransactions && session) {
        await session.commitTransaction();
      }

      return workDoneBookResult;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in upsert:', error);
      throw new InternalServerErrorException('Failed to create or update work done book entry');
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
}
