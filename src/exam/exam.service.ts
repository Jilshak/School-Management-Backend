import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { SemExam } from '../domains/schema/sem-exam.schema';
import { ExamTimeTable } from '../domains/schema/exam-time-table.schema';
import { Result } from '../domains/schema/result.schema';
import { CreateClassTest, CreateSemExamDto } from './dto/create-exam.dto';
import { UpdateSemExamDto, UpdateClassTestDto } from './dto/update-exam.dto';
import { CreateOnlineExamDto } from './dto/create-online-exam.dto';
import { CreateOfflineExamDto } from './dto/create-offline-exam.dto';
import { CreateExamTimeTableDto } from './dto/create-exam-time-table.dto';
import { CreateResultDto } from './dto/create-result.dto';
import { ClassTest } from 'src/domains/schema/class-test.schema';
import { TimeTable } from 'src/domains/schema/timetable.schema';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(SemExam.name) private semExamModel: Model<SemExam>,
    @InjectModel(TimeTable.name) private timeTableModel: Model<TimeTable>,
    @InjectModel(ClassTest.name) private classTestModel: Model<ClassTest>,
    @InjectModel(ExamTimeTable.name)
    private examTimeTableModel: Model<ExamTimeTable>,
    @InjectModel(Result.name) private resultModel: Model<Result>,
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

  async createSemExam(
    createExamDto: CreateSemExamDto,
    schoolId: Types.ObjectId,
  ): Promise<SemExam> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const newExam = new this.semExamModel({
        classId: createExamDto.classId,
        exams: createExamDto.exam.map((exam) => ({
          subjectId: exam.subjectId,
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          description: exam.description,
        })),
        schoolId,
      });

      const savedExam = await newExam.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return savedExam;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      this.handleError(error, 'Failed to create sem exam');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createClassTest(
    createExamDto: CreateClassTest,
    schoolId: Types.ObjectId,
  ): Promise<ClassTest> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const newExam = new this.classTestModel({
        classId: new Types.ObjectId(createExamDto.classId),
        date: createExamDto.date,
        schoolId,
        subjectId: new Types.ObjectId(createExamDto.subjectId),
        periods: createExamDto.periods.map((val) => new Types.ObjectId(val)),
      });

      const savedExam = await newExam.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return savedExam;
    } catch (error) {
      console.log(error);
      if (session) {
        await session.abortTransaction();
      }
      this.handleError(error, 'Failed to create class test');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllOfflineExams(
    page: number,
    limit: number,
    search: string,
    schoolId: Types.ObjectId,
  ) {
    const skip = (page - 1) * limit;

    // Remove the separate searchRegex variable
    // const searchRegex = new RegExp(search, 'i');

    // Ensure limit is a number
    const numericLimit = Number(limit);

    try {
      const classTests = await this.classTestModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectId',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classId',
          },
        },
        {
          $unwind: '$subjectId',
        },
        {
          $unwind: '$classId',
        },
        {
          $lookup: {
            from: 'timetables',
            let: { periods: '$periods', classId: '$classId._id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$classId', '$$classId'] },
                },
              },
              {
                $project: {
                  allDays: {
                    $objectToArray: {
                      monday: '$monday',
                      tuesday: '$tuesday',
                      wednesday: '$wednesday',
                      thursday: '$thursday',
                      friday: '$friday',
                      saturday: '$saturday',
                    },
                  },
                },
              },
              { $unwind: '$allDays' },
              { $unwind: '$allDays.v' },
              {
                $match: {
                  $expr: { $in: ['$allDays.v._id', '$$periods'] },
                },
              },
              {
                $project: {
                  _id: '$allDays.v._id',
                  day: '$allDays.k',
                  startTime: '$allDays.v.startTime',
                  endTime: '$allDays.v.endTime',
                  subjectId: '$allDays.v.subjectId',
                  teacherId: '$allDays.v.teacherId',
                },
              },
            ],
            as: 'timetableEntries',
          },
        },
        {
          $match: {
            $or: [
              { 'classId.name': { $regex: search, $options: 'i' } },
              { 'subjectId.name': { $regex: search, $options: 'i' } },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: numericLimit,
        },
        {
          $project: {
            _id: 1,
            date: 1,
            periods: 1,
            'subjectId._id': 1,
            'subjectId.name': 1,
            'classId._id': 1,
            'classId.name': 1,
            timetableEntries: 1,
            description: 1,
          },
        },
      ]);

      const semExams = await this.semExamModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classId',
          },
        },
        {
          $unwind: '$classId',
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'exams.subjectId',
            foreignField: '_id',
            as: 'subjects',
          },
        },
        {
          $match: {
            $or: [
              { 'classId.name': { $regex: search, $options: 'i' } },
              { 'subjects.name': { $regex: search, $options: 'i' } },
            ],
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: numericLimit,
        },
        {
          $project: {
            _id: 1,
            exams: {
              $map: {
                input: '$exams',
                as: 'exam',
                in: {
                  subjectId: {
                    $arrayElemAt: [
                      '$subjects',
                      { $indexOfArray: ['$subjects._id', '$$exam.subjectId'] },
                    ],
                  },
                  date: '$$exam.date',
                  startTime: '$$exam.startTime',
                  endTime: '$$exam.endTime',
                  description: '$$exam.description',
                },
              },
            },
            'classId._id': 1,
            'classId.name': 1,
          },
        },
      ]);

      const combinedExams = [
        ...classTests.map((test) => ({ ...test, examType: 'Class Test' })),
        ...semExams.map((exam) => ({
          ...exam,
          examType: 'Sem Exam',
          date: exam.exams[0]?.date,
        })),
      ];

      // Sort combined exams by date
      combinedExams.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      );

      return {
        exams: combinedExams,
        total:
          (await this.classTestModel.countDocuments({ schoolId })) +
          (await this.semExamModel.countDocuments({ schoolId })),
        page,
        limit: numericLimit,
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch offline exams');
    }
  }

  async findAllOfflineExamsForStudent(
    classId: Types.ObjectId,
    schoolId: Types.ObjectId,
  ) {
    try {
      const classTests = await this.classTestModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            classId: new Types.ObjectId(classId),
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectId',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classId',
          },
        },
        {
          $unwind: '$subjectId',
        },
        {
          $unwind: '$classId',
        },
        {
          $lookup: {
            from: 'timetables',
            let: { periods: '$periods', classId: '$classId._id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$classId', '$$classId'] },
                },
              },
              {
                $project: {
                  allDays: {
                    $objectToArray: {
                      monday: '$monday',
                      tuesday: '$tuesday',
                      wednesday: '$wednesday',
                      thursday: '$thursday',
                      friday: '$friday',
                      saturday: '$saturday',
                    },
                  },
                },
              },
              { $unwind: '$allDays' },
              { $unwind: '$allDays.v' },
              {
                $match: {
                  $expr: { $in: ['$allDays.v._id', '$$periods'] },
                },
              },
              {
                $project: {
                  _id: '$allDays.v._id',
                  day: '$allDays.k',
                  startTime: '$allDays.v.startTime',
                  endTime: '$allDays.v.endTime',
                  subjectId: '$allDays.v.subjectId',
                  teacherId: '$allDays.v.teacherId',
                },
              },
            ],
            as: 'timetableEntries',
          },
        },
        {
          $project: {
            _id: 1,
            date: 1,
            periods: 1,
            'subjectId._id': 1,
            'subjectId.name': 1,
            'classId._id': 1,
            'classId.name': 1,
            timetableEntries: 1,
            description: 1,
          },
        },
      ]);

      const semExams = await this.semExamModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classId',
          },
        },
        {
          $unwind: '$classId',
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'exams.subjectId',
            foreignField: '_id',
            as: 'subjects',
          },
        },
      
        {
          $project: {
            _id: 1,
            exams: {
              $map: {
                input: '$exams',
                as: 'exam',
                in: {
                  subjectId: {
                    $arrayElemAt: [
                      '$subjects',
                      { $indexOfArray: ['$subjects._id', '$$exam.subjectId'] },
                    ],
                  },
                  date: '$$exam.date',
                  startTime: '$$exam.startTime',
                  endTime: '$$exam.endTime',
                  description: '$$exam.description',
                },
              },
            },
            'classId._id': 1,
            'classId.name': 1,
          },
        },
      ]);

      const combinedExams = [
        ...classTests.map((test) => ({ ...test, examType: 'Class Test' })),
        ...semExams.map((exam) => ({
          ...exam,
          examType: 'Sem Exam',
          date: exam.exams[0]?.date,
        })),
      ];

      // Sort combined exams by date
      combinedExams.sort(
        (a, b) =>
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
      );

      return {
        exams: combinedExams,
        total:
          (await this.classTestModel.countDocuments({ schoolId })) +
          (await this.semExamModel.countDocuments({ schoolId })),
      };
    } catch (error) {
      this.handleError(error, 'Failed to fetch offline exams for student');
    }
  }

  // New CRUD operations for SemExam
  async getSemExam(id: string, schoolId: Types.ObjectId): Promise<any> {
    try {
      const exam = await this.semExamModel
        .aggregate([
          {
            $match: {
              _id: new Types.ObjectId(id),
              schoolId: new Types.ObjectId(schoolId),
            },
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },

          {
            $unwind: '$classroom',
          },
          {
            $lookup: {
              from: 'subjects',
              localField: 'exams.subjectId',
              foreignField: '_id',
              as: 'subjects',
            },
          },
          {
            $project: {
              _id: 1,
              classId: '$classroom._id',
              className: '$classroom.name',
              exams: {
                $map: {
                  input: '$exams',
                  as: 'exam',
                  in: {
                    _id: '$$exam._id',
                    subjectId: '$$exam.subjectId',
                    subjectName: {
                      $let: {
                        vars: {
                          subject: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: '$subjects',
                                  cond: {
                                    $eq: ['$$this._id', '$$exam.subjectId'],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: '$$subject.name',
                      },
                    },
                    date: '$$exam.date',
                    startTime: '$$exam.startTime',
                    endTime: '$$exam.endTime',
                    description: '$$exam.description',
                  },
                },
              },
            },
          },
        ])
        .exec();

      if (!exam || exam.length === 0) {
        throw new NotFoundException(`Semester exam with ID "${id}" not found`);
      }

      return exam[0];
    } catch (error) {
      this.handleError(error, `Failed to get semester exam with ID "${id}"`);
    }
  }

  async updateSemExam(
    id: string,
    updateExamDto: UpdateSemExamDto,
    schoolId: Types.ObjectId,
  ): Promise<SemExam> {
    try {
      const updatedExam = await this.semExamModel
        .findOneAndUpdate(
          { _id: id, schoolId },
          { $set: updateExamDto },
          { new: true },
        )
        .exec();

      if (!updatedExam) {
        throw new NotFoundException(`Semester exam with ID "${id}" not found`);
      }
      return updatedExam;
    } catch (error) {
      this.handleError(error, `Failed to update semester exam with ID "${id}"`);
    }
  }

  async deleteSemExam(id: string, schoolId: Types.ObjectId): Promise<void> {
    try {
      const result = await this.semExamModel
        .deleteOne({ _id: id, schoolId })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Semester exam with ID "${id}" not found`);
      }
    } catch (error) {
      this.handleError(error, `Failed to delete semester exam with ID "${id}"`);
    }
  }

  // New CRUD operations for ClassTest
  async getClassTest(id: string, schoolId: Types.ObjectId) {
    try {
      const classTest = await this.classTestModel
        .aggregate([
          { $match: { _id: new Types.ObjectId(id), schoolId } },
          {
            $lookup: {
              from: 'timetables',
              let: { periods: '$periods', classId: '$classId' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$classId', '$$classId'] },
                  },
                },
                {
                  $project: {
                    allDays: {
                      $objectToArray: {
                        monday: '$monday',
                        tuesday: '$tuesday',
                        wednesday: '$wednesday',
                        thursday: '$thursday',
                        friday: '$friday',
                        saturday: '$saturday',
                      },
                    },
                  },
                },
                { $unwind: '$allDays' },
                { $unwind: '$allDays.v' },
                {
                  $match: {
                    $expr: { $in: ['$allDays.v._id', '$$periods'] },
                  },
                },
                {
                  $project: {
                    _id: '$allDays.v._id',
                    day: '$allDays.k',
                    startTime: '$allDays.v.startTime',
                    endTime: '$allDays.v.endTime',
                    subjectId: '$allDays.v.subjectId',
                    teacherId: '$allDays.v.teacherId',
                  },
                },
              ],
              as: 'timetableEntries',
            },
          },
          {
            $lookup: {
              from: 'subjects',
              localField: 'subjectId',
              foreignField: '_id',
              as: 'subject',
            },
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },
          {
            $project: {
              _id: 1,
              date: 1,
              subjectId: 1,
              classId: 1,
              periods: 1,
              schoolId: 1,
              createdAt: 1,
              updatedAt: 1,
              subject: { $arrayElemAt: ['$subject', 0] },
              classroom: { $arrayElemAt: ['$classroom', 0] },
              timetableEntries: 1,
              description: 1,
            },
          },
        ])
        .exec();

      if (!classTest || classTest.length === 0) {
        throw new NotFoundException(`Class test with ID "${id}" not found`);
      }
      return classTest[0];
    } catch (error) {
      this.handleError(error, `Failed to get class test with ID "${id}"`);
    }
  }

  async updateClassTest(
    id: string,
    updateExamDto: UpdateClassTestDto,
    schoolId: Types.ObjectId,
  ): Promise<ClassTest> {
    try {
      updateExamDto.periods = updateExamDto.periods.map(
        (x) => new Types.ObjectId(x)
      );
      updateExamDto.subjectId = new Types.ObjectId(updateExamDto.subjectId)
      if (updateExamDto.classId) {
        delete updateExamDto.classId;
      }
      const updatedClassTest = await this.classTestModel
        .findOneAndUpdate(
          { _id: id, schoolId },
          { $set: updateExamDto },
          { new: true },
        )
        .exec();

      if (!updatedClassTest) {
        throw new NotFoundException(`Class test with ID "${id}" not found`);
      }
      return updatedClassTest;
    } catch (error) {
      this.handleError(error, `Failed to update class test with ID "${id}"`);
    }
  }

  async deleteClassTest(id: string, schoolId: Types.ObjectId): Promise<void> {
    try {
      const result = await this.classTestModel
        .deleteOne({ _id: id, schoolId })
        .exec();
      if (result.deletedCount === 0) {
        throw new NotFoundException(`Class test with ID "${id}" not found`);
      }
    } catch (error) {
      this.handleError(error, `Failed to delete class test with ID "${id}"`);
    }
  }

  async createResult(createResultDto: CreateResultDto, schoolId: Types.ObjectId): Promise<Result> {
    try {
      const existingResult = await this.resultModel.findOne({
        studentId: new Types.ObjectId(createResultDto.studentId),
        examId: new Types.ObjectId(createResultDto.examId),
        subjectId: new Types.ObjectId(createResultDto.subjectId),
        schoolId: new Types.ObjectId(schoolId),
      });

      if (existingResult) {
        throw new BadRequestException('A result for this student, exam, and subject already exists');
      }

      const newResult = new this.resultModel({
        ...createResultDto,
        studentId: new Types.ObjectId(createResultDto.studentId),
        examId: new Types.ObjectId(createResultDto.examId),
        subjectId: new Types.ObjectId(createResultDto.subjectId),
        schoolId: new Types.ObjectId(schoolId),
      });

      return newResult.save();
    } catch (error) {
      this.handleError(error, 'Failed to create result');
    }
  }

  async getExistingResult(studentId: Types.ObjectId, examId: Types.ObjectId, subjectId: Types.ObjectId, schoolId: Types.ObjectId): Promise<Result | null> {
    try {
      return this.resultModel.findOne({
        studentId,
        examId,
        subjectId,
        schoolId,
      }).exec();
    } catch (error) {
      this.handleError(error, 'Failed to get existing result');
    }
  }

  async getExistingResultOfStudent(studentId: Types.ObjectId, examId: Types.ObjectId, schoolId: Types.ObjectId) {
    try {
      const results = await this.resultModel.aggregate([
        {
          $match: {
            studentId: studentId,
            examId:new Types.ObjectId(examId),
            schoolId: new Types.ObjectId(schoolId),
          }
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectDetails'
          }
        },
        {
          $unwind: '$subjectDetails'
        },
        {
          $lookup: {
            from: 'classTests',
            localField: 'examId',
            foreignField: '_id',
            as: 'classTestDetails'
          }
        },
        {
          $lookup: {
            from: 'semExams',
            localField: 'examId',
            foreignField: '_id',
            as: 'semExamDetails'
          }
        },
        {
          $addFields: {
            examDetails: {
              $cond: {
                if: { $gt: [{ $size: '$classTestDetails' }, 0] },
                then: { $arrayElemAt: ['$classTestDetails', 0] },
                else: { $arrayElemAt: ['$semExamDetails', 0] }
              }
            }
          }
        },
        {
          $project: {
            classTestDetails: 0,
            semExamDetails: 0
          }
        }
      ]);
      return results;
    } catch (error) {
      this.handleError(error, 'Failed to get existing result of student');
    }
  }

  private handleError(error: any, message: string): never {
    console.error(error);
    if (error instanceof NotFoundException) {
      throw error;
    }
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException(message);
  }
}