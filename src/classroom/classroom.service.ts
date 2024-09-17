import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import {
  Classroom,
  ClassroomDocument,
} from '../domains/schema/classroom.schema';
import { Subject, SubjectDocument } from '../domains/schema/subject.schema';
import {
  TimeTable,
  TimeTableDocument,
} from '../domains/schema/timetable.schema';
import {
  Attendance,
  AttendanceDocument,
} from '../domains/schema/attendance.schema';
import { Syllabus, SyllabusDocument } from '../domains/schema/syllabus.schema';
import {
  StudyMaterial,
  StudyMaterialDocument,
} from '../domains/schema/study-material.schema';
import { Result, ResultDocument } from '../domains/schema/result.schema';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateTimeTableDto } from './dto/create-time-table.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';
import { listFilter } from 'src/domains/utility/listFilter';
import { Student } from 'src/domains/schema/students.schema';
import { User } from 'src/domains/schema/user.schema';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectModel(Classroom.name)
    private classroomModel: Model<ClassroomDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(TimeTable.name)
    private timeTableModel: Model<TimeTableDocument>,
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Syllabus.name) private syllabusModel: Model<SyllabusDocument>,
    @InjectModel(StudyMaterial.name)
    private studyMaterialModel: Model<StudyMaterialDocument>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
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

  async create(
    createClassroomDto: CreateClassroomDto,
    schoolId: Types.ObjectId,
  ): Promise<Classroom> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      const createdClassroom = new this.classroomModel({
        ...createClassroomDto,
        subjects: createClassroomDto.subjects.map(
          (subject) => new Types.ObjectId(subject),
        ),
        classTeacherId: new Types.ObjectId(createClassroomDto.classTeacherId),
        schoolId,
      });
      const result = await createdClassroom.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(
    schoolId: Types.ObjectId,
    search?: string,
    full?: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ classrooms: Classroom[]; totalCount: number }> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let aggregationPipeline: any = [
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        {
          $lookup: {
            from: 'teachers',
            localField: 'classTeacherId',
            foreignField: 'userId',
            as: 'teacherDetails',
          },
        },
        {
          $unwind: '$teacherDetails',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'classTeacherId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjects',
            foreignField: '_id',
            as: 'subjectDetails',
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            academicYear: 1,
            classTeacherDetails: {
              name: {
                $concat: [
                  '$teacherDetails.firstName',
                  ' ',
                  '$teacherDetails.lastName',
                ],
              },
              email: '$userDetails.email',
              phoneNumber: '$userDetails.contactNumber',
            },
            subjects: {
              $map: {
                input: '$subjectDetails',
                as: 'subject',
                in: {
                  _id: '$$subject._id',
                  name: '$$subject.name',
                  code: '$$subject.code',
                },
              },
            },
          },
        },
      ];

      if (search) {
        aggregationPipeline.push({
          $match: {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { academicYear: { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      const countPipeline = [...aggregationPipeline, { $count: 'totalCount' }];
      const [countResult] = await this.classroomModel
        .aggregate(countPipeline)
        .session(session);
      const totalCount = countResult ? countResult.totalCount : 0;

      if (!full && page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        aggregationPipeline.push({ $skip: skip }, { $limit: limit });
      }

      const classrooms = await this.classroomModel
        .aggregate(aggregationPipeline)
        .session(session);

      // Filter out classrooms where classTeacher doesn't match the search
      const filteredClassrooms = classrooms.filter(
        (classroom) =>
          classroom.classTeacherDetails &&
          classroom.userDetails &&
          classroom.userDetails.isActive,
      );

      if (session) {
        await session.commitTransaction();
      }
      return { classrooms: filteredClassrooms, totalCount };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch classrooms');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string, schoolId: Types.ObjectId): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const classroom = await this.classroomModel
        .aggregate([
          { $match: { _id: new Types.ObjectId(id), schoolId: schoolId } },
          {
            $lookup: {
              from: 'teachers',
              localField: 'classTeacherId',
              foreignField: 'userId',
              as: 'classTeacherDetails',
            },
          },
          { $unwind: '$classTeacherDetails' },
          {
            $lookup: {
              from: 'users',
              localField: 'classTeacherDetails.userId',
              foreignField: '_id',
              as: 'classTeacherUserDetails',
            },
          },
          { $unwind: '$classTeacherUserDetails' },
          {
            $lookup: {
              from: 'students',
              localField: '_id',
              foreignField: 'classId',
              as: 'studentsDetails',
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'studentsDetails.userId',
              foreignField: '_id',
              as: 'studentsUserDetails',
            },
          },
          {
            $lookup: {
              from: 'subjects',
              localField: 'subjects',
              foreignField: '_id',
              as: 'subjectsDetails',
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              academicYear: 1,
              classTeacher: {
                _id: '$classTeacherDetails._id',
                firstName: '$classTeacherDetails.firstName',
                lastName: '$classTeacherDetails.lastName',
                email: '$classTeacherUserDetails.email',
                isActive: '$classTeacherUserDetails.isActive',
              },
              students: {
                $map: {
                  input: '$studentsDetails',
                  as: 'student',
                  in: {
                    _id: '$$student._id',
                    firstName: '$$student.firstName',
                    lastName: '$$student.lastName',
                    enrollmentNumber: '$$student.enrollmentNumber',
                    email: {
                      $arrayElemAt: [
                        '$studentsUserDetails.email',
                        {
                          $indexOfArray: [
                            '$studentsUserDetails.userId',
                            '$$student.userId',
                          ],
                        },
                      ],
                    },
                    isActive: {
                      $arrayElemAt: [
                        '$studentsUserDetails.isActive',
                        {
                          $indexOfArray: [
                            '$studentsUserDetails.userId',
                            '$$student.userId',
                          ],
                        },
                      ],
                    },
                  },
                },
              },
              subjects: {
                $map: {
                  input: '$subjectsDetails',
                  as: 'subject',
                  in: {
                    _id: '$$subject._id',
                    subjectName: '$$subject.subjectName',
                    isActive: '$$subject.isActive',
                  },
                },
              },
            },
          },
        ])
        .session(session);

      if (!classroom || classroom.length === 0) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return classroom[0];
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(
    id: string,
    updateClassroomDto: CreateClassroomDto,
    schoolId: Types.ObjectId,
  ): Promise<Classroom> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedClassroom = await this.classroomModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          updateClassroomDto,
          { new: true, session },
        )
        .exec();
      if (!updatedClassroom) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedClassroom;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async remove(
    id: string,
    schoolId: Types.ObjectId,
    makeStudentsAlsoInactive: boolean,
  ): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Check if there are any students in this classroom
      const studentsInClassroom = await this.studentModel
        .find({ classId: new Types.ObjectId(id) })
        .session(session)
        .exec();

      if (makeStudentsAlsoInactive) {
        // Make all students in the classroom inactive
        await this.userModel
          .updateMany(
            { classId: new Types.ObjectId(id) },
            { $set: { isActive: false } },
          )
          .session(session)
          .exec();
      } else if (studentsInClassroom.length > 0) {
        throw new Error(
          'Cannot delete classroom. There are students assigned to this class. Please change their class before deleting.',
        );
      }

      // Make the classroom inactive
      const result = await this.classroomModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          { $set: { isActive: false } },
        )
        .session(session)
        .exec();

      if (!result) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
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
      if (error.message.includes('Cannot delete classroom')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to remove classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getSyllabus(subjectId: string): Promise<Syllabus> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const syllabus = await this.syllabusModel
        .findOne({ subjectId })
        .session(session)
        .exec();
      if (!syllabus) {
        throw new NotFoundException(
          `Syllabus for subject with ID ${subjectId} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
      return syllabus;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch syllabus');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async manageSyllabus(
    createSyllabusDto: CreateSyllabusDto,
  ): Promise<Syllabus> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSyllabus = new this.syllabusModel(createSyllabusDto);
      const result = await createdSyllabus.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to manage syllabus');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createStudyMaterial(
    createStudyMaterialDto: CreateStudyMaterialDto,
  ): Promise<StudyMaterial> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdStudyMaterial = new this.studyMaterialModel(
        createStudyMaterialDto,
      );
      const result = await createdStudyMaterial.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create study material');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getStudyMaterials(
    subjectId?: string,
    type?: string,
    page?: number,
    limit?: number,
  ): Promise<StudyMaterial[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let query = this.studyMaterialModel.find().session(session);

      if (subjectId) {
        query = query.where('subjectId').equals(subjectId);
      }

      if (type) {
        query = query.where('type').equals(type);
      }

      if (page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }

      const result = await query.exec();

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch study materials');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getTeacherNotClassTeacher(schoolId: Types.ObjectId) {
    try {
      const classTeachers = await this.classroomModel.distinct('classTeacherId', { schoolId });
      
      const nonClassTeachers = await this.userModel.aggregate([
        { $match: { schoolId, role: 'teacher', isActive: true, _id: { $nin: classTeachers } } },
        {
          $lookup: {
            from: 'teachers',
            localField: '_id',
            foreignField: 'userId',
            as: 'teacherDetails'
          }
        },
        { $unwind: '$teacherDetails' },
        {
          $project: {
            _id: 1,
            email: 1,
            firstName: '$teacherDetails.firstName',
            lastName: '$teacherDetails.lastName'
          }
        }
      ]);

      return nonClassTeachers;
    } catch (err) {
      throw new InternalServerErrorException('Failed to fetch non-class teachers');
    }
  }
}
