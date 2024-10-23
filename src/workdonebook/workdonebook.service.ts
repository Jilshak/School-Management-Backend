import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
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

      for (const dto of flattenedDtos) {
        const classDailyRecordFilter = {
          date: date,
          classroomId: new Types.ObjectId(dto.classroomId),
          schoolId: schoolId,
        };

        const existingRecord = await this.classDailyRecordModel.findOne({
          ...classDailyRecordFilter,
          'entries.teacherId': new Types.ObjectId(teacherId),
          'entries.subjectId': new Types.ObjectId(dto.subjectId),
        });

        let classDailyRecordUpdate;
        let classDailyRecordOptions;

        if (existingRecord) {
          // Update existing entry
          classDailyRecordUpdate = {
            $set: {
              'entries.$[elem].topics': dto.topics,
              'entries.$[elem].activities': dto.activities,
              'entries.$[elem].homework': dto.homework,
            },
          };

          classDailyRecordOptions = {
            arrayFilters: [
              {
                'elem.teacherId': new Types.ObjectId(teacherId),
                'elem.subjectId': new Types.ObjectId(dto.subjectId),
              },
            ],
            new: true,
            session,
          };
        } else {
          // Add new entry
          classDailyRecordUpdate = {
            $push: {
              entries: {
                teacherId: new Types.ObjectId(teacherId),
                subjectId: new Types.ObjectId(dto.subjectId),
                topics: dto.topics,
                activities: dto.activities,
                homework: dto.homework,
              },
            },
            $setOnInsert: {
              date: date,
              classroomId: new Types.ObjectId(dto.classroomId),
              schoolId: schoolId,
            },
          };

          classDailyRecordOptions = {
            upsert: true,
            new: true,
            session,
          };
        }

        await this.classDailyRecordModel.findOneAndUpdate(
          classDailyRecordFilter,
          classDailyRecordUpdate,
          classDailyRecordOptions
        );
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

  async getDailyWorkDoneBooks(dateString: string | undefined, userId: Types.ObjectId, schoolId: Types.ObjectId, roles?: string[]) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let date: Date;
      if (dateString) {
        date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
        }
      } else {
        date = new Date();
        date.setUTCHours(0, 0, 0, 0);
      }

      const isAdmin = roles?.includes('admin');

      const pipeline = [
        {
          $match: {
            date: date,
            schoolId: schoolId,
            ...(isAdmin ? {} : { teacherId: userId })
          }
        },
        {
          $lookup: {
            from: 'staffs',
            localField: 'teacherId',
            foreignField: 'userId',
            as: 'teacherInfo'
          }
        },
        { $unwind: '$teacherInfo' },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'entries.classroomId',
            foreignField: '_id',
            as: 'classroomInfo'
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'entries.subjectId',
            foreignField: '_id',
            as: 'subjectInfo'
          }
        },
        {
          $addFields: {
            entries: {
              $map: {
                input: '$entries',
                as: 'entry',
                in: {
                  $mergeObjects: [
                    '$$entry',
                    {
                      classroom: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$classroomInfo',
                              as: 'classroom',
                              cond: { $eq: ['$$classroom._id', '$$entry.classroomId'] }
                            }
                          },
                          0
                        ]
                      },
                      subject: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$subjectInfo',
                              as: 'subject',
                              cond: { $eq: ['$$subject._id', '$$entry.subjectId'] }
                            }
                          },
                          0
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            date: 1,
            schoolId: 1,
            teacherId: 1,
            teacherName: {
              $concat: ['$teacherInfo.firstName', ' ', '$teacherInfo.lastName']
            },
            entries: {
              $map: {
                input: '$entries',
                as: 'entry',
                in: {
                  _id: '$$entry._id',
                  classroomId: '$$entry.classroomId',
                  classroomName: '$$entry.classroom.name',
                  subjectId: '$$entry.subjectId',
                  subjectName: '$$entry.subject.name',
                  topics: '$$entry.topics',
                  activities: '$$entry.activities',
                  homework: '$$entry.homework'
                }
              }
            }
          }
        }
      ];

      const workDoneBooks = await this.workDoneBookModel.aggregate(pipeline).session(session);

      if (workDoneBooks.length === 0) {
        throw new NotFoundException('No work done book entry found for the specified date.');
      }

      if (supportsTransactions && session) {
        await session.commitTransaction();
      }

      return workDoneBooks;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getDailyWorkDoneBooks:', error);
      throw new InternalServerErrorException('Failed to retrieve daily work done book entry');
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
}
