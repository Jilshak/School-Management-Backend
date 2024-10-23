import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassDailyRecord } from '../domains/schema/classDailyRecord.schema';
import { CreateClassDailyRecordDto } from './dto/create-classdailyrecord.dto';
import { Classroom } from '../domains/schema/classroom.schema';
import { Teacher } from '../domains/schema/teacher.schema';
import { Subject } from '../domains/schema/subject.schema';

@Injectable()
export class ClassDailyRecordService {
  constructor(
    @InjectModel(ClassDailyRecord.name) private classDailyRecordModel: Model<ClassDailyRecord>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
  ) {}

  async upsert(createClassDailyRecordDto: CreateClassDailyRecordDto, schoolId: Types.ObjectId) {
    try {
      const { date, classroomId, entries } = createClassDailyRecordDto;
      const parsedDate = new Date(date);

      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      const filter = {
        date: parsedDate,
        classroomId: new Types.ObjectId(classroomId),
        schoolId: schoolId,
      };

      const update = {
        $set: {
          entries: entries.map(entry => ({
            ...entry,
            teacherId: new Types.ObjectId(entry.teacherId),
            subjectId: new Types.ObjectId(entry.subjectId),
          })),
        },
        $setOnInsert: filter,
      };

      const options = { upsert: true, new: true };

      const result = await this.classDailyRecordModel.findOneAndUpdate(filter, update, options);

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error in upsert:', error);
      throw new InternalServerErrorException('Failed to create or update class daily record');
    }
  }

  async getByClassroomAndDate(classroomId: string | null, date: string, schoolId: Types.ObjectId) {
    try {
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0);

      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      const pipeline = [
        {
          $match: {
            date: parsedDate,
            schoolId: schoolId,
            ...(classroomId ? { classroomId: new Types.ObjectId(classroomId) } : {})
          }
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classroomId',
            foreignField: '_id',
            as: 'classroom'
          }
        },
        { $unwind: '$classroom' },
        {
          $lookup: {
            from: 'teachers',
            localField: 'entries.teacherId',
            foreignField: 'userId',
            as: 'teacherInfo'
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
          $lookup: {
            from: 'staffs',
            localField: 'teacherInfo.userId',
            foreignField: 'userId',
            as: 'staffInfo'
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
                      teacher: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$teacherInfo',
                              as: 'teacher',
                              cond: { $eq: ['$$teacher._id', '$$entry.teacherId'] }
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
                      },
                      staff: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: '$staffInfo',
                              as: 'staff',
                              cond: { $eq: ['$$staff.userId', '$$entry.teacherId'] }
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
            classroomId: 1,
            classroomName: '$classroom.name',
            entries: {
              $map: {
                input: '$entries',
                as: 'entry',
                in: {
                  _id: '$$entry._id',
                  teacherId: '$$entry.teacherId',
                  teacherUserId: '$$entry.teacher.userId',
                  teacherName: {
                    $concat: [
                      { $ifNull: ['$$entry.staff.firstName', ''] },
                      ' ',
                      { $ifNull: ['$$entry.staff.lastName', ''] }
                    ]
                  },
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

      const records = await this.classDailyRecordModel.aggregate(pipeline);

      if (records.length === 0) {
        throw new NotFoundException('Class daily record not found');
      }

      return records;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve class daily record');
    }
  }
}
