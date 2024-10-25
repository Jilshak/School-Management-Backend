import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { LessonPlan } from '../domains/schema/lessonplan.schema';
import { CreateLessonPlanDto } from './dto/create-lessonplan.dto';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class LessonPlanService {
  constructor(
    @InjectModel(LessonPlan.name) private lessonPlanModel: Model<LessonPlan>,
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

  async upsert(lessonPlanData: any, teacherId: Types.ObjectId, schoolId: Types.ObjectId) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      if (!Array.isArray(lessonPlanData) || lessonPlanData.length === 0) {
        throw new BadRequestException('Invalid lesson plan data');
      }

      const lessonPlan = lessonPlanData[0]; // Get the first (and only) item in the array

      if (!lessonPlan.entries || !Array.isArray(lessonPlan.entries) || lessonPlan.entries.length === 0) {
        throw new BadRequestException('No entries provided');
      }

      const startDate = new Date(lessonPlan.startDate);
      const endDate = new Date(lessonPlan.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      const filter = {
        startDate: startDate,
        endDate: endDate,
        teacherId: teacherId,
        schoolId: schoolId,
      };

      const update = {
        $set: {
          startDate: startDate,
          endDate: endDate,
          teacherId: teacherId,
          schoolId: schoolId,
          entries: lessonPlan.entries.map(entry => ({
            classroomId: new Types.ObjectId(entry.classroomId),
            subjectId: new Types.ObjectId(entry.subjectId),
            topics: entry.topics,
            activities: entry.activities,
            chapters: entry.chapters,
            objectives: entry.objectives,
            corePoints: entry.corePoints,
            evaluations: entry.evaluations,
            learningOutcomes: entry.learningOutcomes,
          })),
        }
      };

      const options = { upsert: true, new: true, session };

      const result = await this.lessonPlanModel.findOneAndUpdate(filter, update, options);

      if (supportsTransactions && session) {
        await session.commitTransaction();
      }

      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in upsert:', error);
      throw new InternalServerErrorException('Failed to create or update lesson plan entry');
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  async getWeeklyLessonPlans(startDateString: string | undefined, endDateString: string | undefined, userId: Types.ObjectId, schoolId: Types.ObjectId, roles?: string[]) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let startDate: Date;
      let endDate: Date;
      if (startDateString) {
        startDate = new Date(startDateString);
        if (isNaN(startDate.getTime())) {
          throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
        }
      } else {
        startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
      }

      if (endDateString) {
        endDate = new Date(endDateString);
        if (isNaN(endDate.getTime())) {
          throw new BadRequestException('Invalid date format. Please use YYYY-MM-DD.');
        }
      } else {
        endDate = new Date();
        endDate.setUTCHours(0, 0, 0, 0);
      }

      const isAdmin = roles?.includes('admin');

      const pipeline = [
        {
          $match: {
            startDate: startDate,
            endDate: endDate,
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
                  chapters: '$$entry.chapters',
                  objectives: '$$entry.objectives',
                  corePoints: '$$entry.corePoints',
                  evaluations: '$$entry.evaluations',
                  learningOutcomes: '$$entry.learningOutcomes'
                }
              }
            }
          }
        }
      ];

      const lessonPlans = await this.lessonPlanModel.aggregate(pipeline).session(session);

      if (lessonPlans.length === 0) {
        throw new NotFoundException('No lesson plan entry found for the specified date.');
      }

      if (supportsTransactions && session) {
        await session.commitTransaction();
      }

      return lessonPlans;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in getDailyLessonPlans:', error);
      throw new InternalServerErrorException('Failed to retrieve daily lesson plan entry');
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
}
