import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import {Attendance} from 'src/domains/schema/attendance.schema';
import { Model } from 'mongoose';
import { Student } from 'src/domains/schema/students.schema';
import { User } from 'src/domains/schema/user.schema';
import { Classroom } from 'src/domains/schema/classroom.schema';
import { LeaveReqDto } from './dto/create-leave-request.dto';
import { Leave } from 'src/domains/schema/leave.schema';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    @InjectModel(Leave.name) private leaveModel: Model<Leave>,
  ) {}

async create(
  createAttendanceDto: CreateAttendanceDto,
  schoolId: Types.ObjectId,
): Promise<Attendance> {
  try {
    const {
      classId,
      teacherId,
      attendanceDate,
      studentsAttendance,
      ...rest
    } = createAttendanceDto;
    const dateToCompare = new Date(attendanceDate);
    dateToCompare.setUTCHours(0, 0, 0, 0);
    const filter = {
      classId: new Types.ObjectId(classId),
      schoolId,
      attendanceDate: {
        $gte: dateToCompare,
        $lt: new Date(dateToCompare.getTime() + 24 * 60 * 60 * 1000),
      },
    };

    const update = {
      $set: {
        ...rest,
        attendanceDate: dateToCompare,
        teacherId: new Types.ObjectId(teacherId),
      },
    };

    const options = {
      new: true,
      upsert: true,
    };

    const updatedAttendance = await this.attendanceModel.findOneAndUpdate(filter, update, options);

    // If the document was just created or studentsAttendance is empty, set the studentsAttendance
    if (!updatedAttendance.studentsAttendance || updatedAttendance.studentsAttendance.length === 0) {
      updatedAttendance.studentsAttendance = studentsAttendance.map(student => ({
        ...student,
        studentId: new Types.ObjectId(student.studentId),
        remark: student.remark || '' // Ensure remark is always present
      }));
    } else {
      // Update existing studentsAttendance
      updatedAttendance.studentsAttendance = updatedAttendance.studentsAttendance.map(existingStudent => {
        const updatedStudent = studentsAttendance.find(s => s.studentId.toString() === existingStudent.studentId.toString());
        if (updatedStudent) {
          return {
            ...existingStudent,
            status: updatedStudent.status,
            remark: updatedStudent.remark || existingStudent.remark || ''
          };
        }
        return existingStudent;
      });
    }

    // Save the changes
    await updatedAttendance.save();

    return updatedAttendance;
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
    studentId: string | Types.ObjectId,
    schoolId: Types.ObjectId,
    month?: number,
  ): Promise<any> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);
      const currentDate = new Date();
      const targetMonth = month !== undefined ? month : currentDate.getMonth();
      
      // Determine the academic year
      const academicYearStart = 8; // September (0-based index)
      let targetYear = currentDate.getFullYear();
      
      if (targetMonth < academicYearStart) {
        targetYear = currentDate.getMonth() < academicYearStart ? currentDate.getFullYear() : currentDate.getFullYear() + 1;
      } else {
        targetYear = currentDate.getMonth() >= academicYearStart ? currentDate.getFullYear() : currentDate.getFullYear() - 1;
      }

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
            let: { classId: '$user.classId', studentId: '$userId' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$classId', '$$classId'] },
                      { $gte: ['$attendanceDate', firstDayOfMonth] },
                      { $lte: ['$attendanceDate', lastDayOfMonth] },
                    ],
                  },
                },
              },
              { $unwind: '$studentsAttendance' },
              {
                $match: {
                  $expr: { $eq: ['$studentsAttendance.studentId', '$$studentId'] },
                },
              },
              { $sort: { attendanceDate: 1 } },
              {
                $project: {
                  date: '$attendanceDate',
                  status: '$studentsAttendance.status',
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
    attendanceUpdates: { date: Date; status: string; remark?: string }[],
  ): Promise<any> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);

      for (const update of attendanceUpdates) {
        const startOfDay = new Date(update.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(update.date);
        endOfDay.setHours(23, 59, 59, 999);

        await this.attendanceModel.updateOne(
          {
            schoolId: schoolId,
            attendanceDate: { $gte: startOfDay, $lte: endOfDay },
            'studentsAttendance.studentId': studentObjectId
          },
          {
            $set: {
              'studentsAttendance.$.status': update.status,
              'studentsAttendance.$.remark': update.remark || ''
            }
          }
        );
      }

      // Fetch and return the updated attendance records
      const updatedRecords = await this.attendanceModel.find({
        schoolId: schoolId,
        'studentsAttendance.studentId': studentObjectId,
        attendanceDate: {
          $in: attendanceUpdates.map(update => new Date(update.date))
        }
      }).lean();

      return {
        studentId: studentId,
        updatedAttendance: updatedRecords.map(record => ({
          date: record.attendanceDate,
          status: record.studentsAttendance.find(sa => sa.studentId.toString() === studentId)?.status,
          remark: record.studentsAttendance.find(sa => sa.studentId.toString() === studentId)?.remark
        }))
      };
    } catch (err) {
      throw err;
    }
  }

  async createLeaveRequest(leaveReqDto: LeaveReqDto, studentId: Types.ObjectId,classId:Types.ObjectId) {
    try {
      const existingLeave = await this.leaveModel.findOne({studentId,classId,startDate:{$gte:leaveReqDto.startDate,$lte:leaveReqDto.endDate}})
      if(existingLeave){
        throw new BadRequestException("Leave request already exists")
      }
      const leave = new this.leaveModel({...leaveReqDto,studentId,classId})
     await leave.save()
     return leave
    } catch (error) {
      throw error
    }
  }

  async getLeaveRequestStudent( studentId: Types.ObjectId,classId:Types.ObjectId) {
    try {
      const leave = await this.leaveModel.find({studentId,classId})
     return leave
    } catch (error) {
      throw error
    }
  }
}