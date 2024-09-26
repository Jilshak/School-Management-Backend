import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {Attendance} from 'src/domains/schema/attendance.schema';
import { Model } from 'mongoose';
import { Student } from 'src/domains/schema/students.schema';
import { User } from 'src/domains/schema/user.schema';
import { Classroom } from 'src/domains/schema/classroom.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
  ) {}

  async create(
    createAttendanceDto: CreateAttendanceDto,
    schoolId: Types.ObjectId,
  ): Promise<Attendance | null> {
    try {
      const {
        classId,
        teacherId,
        attendanceDate,
        studentsAttendance,
        ...rest
      } = createAttendanceDto;

      // Check if attendance for this class and date already exists
      const existingAttendance = await this.attendanceModel.findOne({
        classId: new Types.ObjectId(classId),
        attendanceDate: new Date(attendanceDate),
      });

      if (existingAttendance) {
        // Attendance for today already exists, return null
        return null;
      }

      const newAttendance = new this.attendanceModel({
        ...rest,
        attendanceDate,
        classId: new Types.ObjectId(classId),
        teacherId: new Types.ObjectId(teacherId),
        schoolId,
        studentsAttendance: studentsAttendance.map((student) => ({
          ...student,
          studentId: new Types.ObjectId(student.studentId),
        })),
      });

      return await newAttendance.save();
    } catch (err) {
      throw err;
    }
  }

  async findAll(classId: string,month:Date = new Date()): Promise<any[]> {
    try {
      month = new Date(month)
      const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDayOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const attendanceRecords = await this.attendanceModel
        .find({
          classId: new Types.ObjectId(classId),
          attendanceDate: {
            $gte: firstDayOfMonth,
            $lte: lastDayOfMonth,
          },
        })
        .lean()
        .exec();

      const studentMap = new Map();

      attendanceRecords.forEach((record) => {
        record.studentsAttendance.forEach((studentAttendance) => {
          const studentId = studentAttendance.studentId.toString();
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              studentId: studentId,
              attendanceRecords: [],
            });
          }
          studentMap.get(studentId).attendanceRecords.push({
            date: record.attendanceDate,
            status: studentAttendance.status,
          });
        });
      });

      const studentsWithAttendance = Array.from(studentMap.values());

      // Populate student details
      // await this.studentModel.populate(studentsWithAttendance, {
      //   path: 'studentId',
      //   select: 'userId firstName lastName enrollmentNumber',
      //   populate: {
      //     path: 'userId',
      //     select: 'username',
      //   },
      // });

      return studentsWithAttendance;
    } catch (err) {
      console.log(err)
      throw err;
    }
  }

  async findOfaDate(
    classId: string,
    schoolId: Types.ObjectId,
    date: Date = new Date(),
  ): Promise<any[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const attendanceRecords = await this.attendanceModel.aggregate([
        {
          $match: {
            classId: new Types.ObjectId(classId),
            attendanceDate: { $gte: startOfDay, $lte: endOfDay },
            schoolId,
          },
        },
        {
          $unwind: '$studentsAttendance'
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentsAttendance.studentId',
            foreignField: 'userId',
            as: 'studentDetails'
          }
        },
        {
          $unwind: '$studentDetails'
        },
        {
          $lookup: {
            from: 'users',
            localField: 'studentDetails.userId',
            foreignField: '_id',
            as: 'userDetails'
          }
        },
        {
          $unwind: '$userDetails'
        },
        {
          $project: {
            _id: 0,
            studentId: '$studentsAttendance.studentId',
            status: '$studentsAttendance.status',
            firstName: '$studentDetails.firstName',
            lastName: '$studentDetails.lastName',
            enrollmentNumber: '$studentDetails.enrollmentNumber',
            username: '$userDetails.username'
          }
        }
      ]);

      return attendanceRecords;
    } catch (err) {
      throw err;
    }
  }

  async findOne(
    studentId: string,
    schoolId: Types.ObjectId,
    month?: number,
  ): Promise<any> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);
      const currentDate = new Date();
      const targetMonth = month !== undefined ? month : currentDate.getMonth();
      const targetYear = currentDate.getFullYear();

      const firstDayOfMonth = new Date(targetYear, targetMonth, 1);
      const lastDayOfMonth = new Date(targetYear, targetMonth + 1, 0);

      const result = await this.studentModel.aggregate([
        // Match the student
        { $match: { userId: studentObjectId } },

        // Lookup and unwind the user document
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },

        // Match the school
        { $match: { 'user.schoolId': schoolId } },

        // Lookup attendance records
        {
          $lookup: {
            from: 'attendances',
            let: { classId: '$user.classId', studentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$classId', '$$classId'] },
                      { $in: ['$$studentId', '$studentsAttendance.studentId'] },
                      { $gte: ['$attendanceDate', firstDayOfMonth] },
                      { $lte: ['$attendanceDate', lastDayOfMonth] },
                    ],
                  },
                },
              },
              { $sort: { attendanceDate: 1 } },
              {
                $project: {
                  date: '$attendanceDate',
                  status: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$studentsAttendance',
                          cond: { $eq: ['$$this.studentId', '$$studentId'] },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
              {
                $project: {
                  date: 1,
                  status: '$status.status',
                },
              },
            ],
            as: 'attendanceReport',
          },
        },

        // Project the final result
        {
          $project: {
            student: {
              id: '$_id',
              name: { $concat: ['$firstName', ' ', '$lastName'] },
              enrollmentNumber: '$enrollmentNumber',
            },
            attendanceReport: 1,
          },
        },
      ]);

      if (result.length === 0) {
        throw new NotFoundException('Student not found');
      }

      return result[0];
    } catch (err) {
      throw err;
    }
  }

  async updateByClass(
    classId: string,
    updateAttendanceDto: UpdateAttendanceDto,
    schoolId: Types.ObjectId,
  ): Promise<Attendance | null> {
    try {
      const { attendanceDate, studentsAttendance } = updateAttendanceDto;

      // Verify the classId with schoolId
      const classroom = await this.classroomModel.findOne({
        _id: new Types.ObjectId(classId),
        schoolId: schoolId,
      });

      if (!classroom) {
        throw new NotFoundException(
          'Classroom not found or does not belong to the specified school',
        );
      }

      const updatedAttendance = await this.attendanceModel.findOneAndUpdate(
        {
          classId: new Types.ObjectId(classId),
          attendanceDate: new Date(attendanceDate),
        },
        {
          $set: {
            studentsAttendance: studentsAttendance.map((student) => ({
              ...student,
              studentId: new Types.ObjectId(student.studentId),
            })),
          },
        },
        { new: true },
      );

      if (!updatedAttendance) {
        throw new NotFoundException('Attendance record not found');
      }

      return updatedAttendance;
    } catch (err) {
      throw err;
    }
  }

  async updateByStudent(
    studentId: string,
    schoolId: Types.ObjectId,
    attendanceUpdates: { date: Date; status: string }[],
  ): Promise<any> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);

      const result = await this.studentModel.aggregate([
        // Match the student by userId
        { $match: { userId: studentObjectId } },

        // Lookup and unwind the user document
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },

        // Match the school
        { $match: { 'user.schoolId': schoolId } },

        // Lookup and update attendance records
        {
          $lookup: {
            from: 'attendances',
            let: { classId: '$user.classId', studentId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$classId', '$$classId'] },
                      { $in: ['$$studentId', '$studentsAttendance.studentId'] },
                      {
                        $in: [
                          '$attendanceDate',
                          attendanceUpdates.map((update) => update.date),
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $addFields: {
                  studentsAttendance: {
                    $map: {
                      input: '$studentsAttendance',
                      as: 'sa',
                      in: {
                        $cond: [
                          { $eq: ['$$sa.studentId', '$$studentId'] },
                          {
                            $mergeObjects: [
                              '$$sa',
                              {
                                status: {
                                  $arrayElemAt: [
                                    attendanceUpdates.map(
                                      (update) => update.status,
                                    ),
                                    {
                                      $indexOfArray: [
                                        attendanceUpdates.map(
                                          (update) => update.date,
                                        ),
                                        '$attendanceDate',
                                      ],
                                    },
                                  ],
                                },
                              },
                            ],
                          },
                          '$$sa',
                        ],
                      },
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  studentsAttendance: 1,
                },
              },
            ],
            as: 'updatedAttendance',
          },
        },

        // Project the final result
        {
          $project: {
            student: {
              id: '$userId', // Change this to userId
              name: { $concat: ['$firstName', ' ', '$lastName'] },
              enrollmentNumber: '$enrollmentNumber',
            },
            updatedAttendance: 1,
          },
        },
      ]);

      // Manually update the attendance records
      for (const doc of result[0].updatedAttendance) {
        await this.attendanceModel.updateOne(
          { _id: doc._id },
          { $set: { studentsAttendance: doc.studentsAttendance } },
        );
      }

      if (result.length === 0) {
        throw new NotFoundException(
          'Student not found or attendance records not updated',
        );
      }

      return result[0];
    } catch (err) {
      throw err;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} attendance`;
  }
}
