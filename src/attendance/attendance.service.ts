import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Attendance } from 'src/domains/schema/attendance.schema';
import { Model } from 'mongoose';
import { Student } from 'src/domains/schema/students.schema';
import { User } from 'src/domains/schema/user.schema';
import { Classroom } from 'src/domains/schema/classroom.schema';
import { LeaveReqDto } from './dto/create-leave-request.dto';
import { Leave } from 'src/domains/schema/leave.schema';
import { NotificationService } from 'src/notification/notification.service';
import { WhatsAppService } from 'src/notification/whatsapp.service';
import { School } from 'src/domains/schema/school.schema';
import { AttendanceRegularization } from '../domains/schema/attendance-regularization.schema';
import { CreateRegularizationDto } from './dto/regularization.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<Attendance>,
    private notificationService: NotificationService,
    private whatsappService: WhatsAppService,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
    @InjectModel(Leave.name) private leaveModel: Model<Leave>,
    @InjectModel(AttendanceRegularization.name)
    private attendanceRegularizationModel: Model<AttendanceRegularization>,
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

      const updatedAttendance = await this.attendanceModel.findOneAndUpdate(
        filter,
        update,
        options,
      );

      // If the document was just created or studentsAttendance is empty, set the studentsAttendance
      if (
        !updatedAttendance.studentsAttendance ||
        updatedAttendance.studentsAttendance.length === 0
      ) {
        updatedAttendance.studentsAttendance = studentsAttendance.map(
          (student) => ({
            ...student,
            studentId: new Types.ObjectId(student.studentId),
            remark: student.remark || '', // Ensure remark is always present
            isRegularized: false,
          }),
        );
      } else {
        // Update existing studentsAttendance
        updatedAttendance.studentsAttendance =
          updatedAttendance.studentsAttendance.map((existingStudent) => {
            const updatedStudent = studentsAttendance.find(
              (s) =>
                s.studentId.toString() === existingStudent.studentId.toString(),
            );
            if (updatedStudent) {
              return {
                ...existingStudent,
                status: updatedStudent.status,
                remark: updatedStudent.remark || existingStudent.remark || '',
              };
            }
            return existingStudent;
          });
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
      const classroom = await this.classroomModel.findOne({_id:classId})
      const school = await this.schoolModel.findOne({_id:schoolId})
      newAttendance.studentsAttendance.forEach(async (student) => {
        if(student.status.toLowerCase() === "absent"){
        const user = await this.studentModel.findOne({userId:new Types.ObjectId(student.studentId)})
          await this.whatsappService.attendenceNotify([user.contactNumber,user.parentsDetails.guardianContactNumber],`${user.firstName} ${user.lastName}`,school.name,classroom.name,"Absent")
        }
      })
      // Save the changes
      await updatedAttendance.save();

      return updatedAttendance;
    } catch (err) {
      throw err;
    }
  }

  async findAll(classId: string, month: Date = new Date()): Promise<any[]> {
    try {
      month = new Date(month);
      const firstDayOfMonth = new Date(
        month.getFullYear(),
        month.getMonth(),
        1,
      );
      const lastDayOfMonth = new Date(
        month.getFullYear(),
        month.getMonth() + 1,
        0,
      );

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
      console.log(err);
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
          $unwind: '$studentsAttendance',
        },
        {
          $lookup: {
            from: 'students',
            localField: 'studentsAttendance.studentId',
            foreignField: 'userId',
            as: 'studentDetails',
          },
        },
        {
          $unwind: '$studentDetails',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'studentDetails.userId',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: '$userDetails',
        },
        {
          $project: {
            _id: 0,
            studentId: '$studentsAttendance.studentId',
            status: '$studentsAttendance.status',
            firstName: '$studentDetails.firstName',
            lastName: '$studentDetails.lastName',
            enrollmentNumber: '$studentDetails.enrollmentNumber',
            username: '$userDetails.username',
          },
        },
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
    year?: number
  ): Promise<any> {
    try {
      const studentObjectId = new Types.ObjectId(studentId);
      const currentDate = new Date();
      const targetMonth = month !== undefined ? month : currentDate.getMonth();
      const targetYear = year !== undefined ? year : currentDate.getFullYear();
  
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
                  $expr: {
                    $eq: ['$studentsAttendance.studentId', '$$studentId'],
                  },
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
            'studentsAttendance.studentId': studentObjectId,
          },
          {
            $set: {
              'studentsAttendance.$.status': update.status,
              'studentsAttendance.$.remark': update.remark || '',
            },
          },
        );
      }

      // Fetch and return the updated attendance records
      const updatedRecords = await this.attendanceModel
        .find({
          schoolId: schoolId,
          'studentsAttendance.studentId': studentObjectId,
          attendanceDate: {
            $in: attendanceUpdates.map((update) => new Date(update.date)),
          },
        })
        .lean();

      return {
        studentId: studentId,
        updatedAttendance: updatedRecords.map((record) => ({
          date: record.attendanceDate,
          status: record.studentsAttendance.find(
            (sa) => sa.studentId.toString() === studentId,
          )?.status,
          remark: record.studentsAttendance.find(
            (sa) => sa.studentId.toString() === studentId,
          )?.remark,
        })),
      };
    } catch (err) {
      throw err;
    }
  }

  async createLeaveRequest(
    leaveReqDto: LeaveReqDto,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const existingLeaves = await this.leaveModel
        .find({
          studentId,
          classId,
          startDate: { $gte: leaveReqDto.startDate, $lte: leaveReqDto.endDate },
        })
        .sort({ createdAt: -1 });

      if (existingLeaves.length > 0) {
        if (existingLeaves[0].status !== 'rejected') {
          throw new BadRequestException('Leave request already exists');
        }

        const rejectedCount = existingLeaves.filter(
          (leave) => leave.status === 'rejected',
        ).length;

        if (rejectedCount >= 5) {
          throw new BadRequestException(
            'You have exceeded the maximum number of leave requests for these dates',
          );
        }
      }
      const leave = new this.leaveModel({ ...leaveReqDto, studentId, classId });
      await leave.save();
      return leave;
    } catch (error) {
      throw error;
    }
  }

  async updateLeaveRequest(
    leaveId: string | Types.ObjectId,
    leaveReqDto: LeaveReqDto,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      leaveId = new Types.ObjectId(leaveId);
      const existingLeave = await this.leaveModel.findOne({
        _id: leaveId,
        classId,
        studentId,
        status: 'pending',
      });

      if (!existingLeave) {
        throw new BadRequestException(
          'Leave request not found or cannot be edited',
        );
      }

      const updatedLeave = await this.leaveModel.findByIdAndUpdate(
        leaveId,
        { $set: { ...leaveReqDto } },
        { new: true },
      );

      return updatedLeave;
    } catch (error) {
      throw error;
    }
  }

  async getLeaveRequestStudent(
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const leave = await this.leaveModel
        .find({ studentId, classId })
        .sort({ createdAt: -1 })
        .lean();
      return leave;
    } catch (error) {
      throw error;
    }
  }

  async getLeaveRequestClassTEacher(userId: Types.ObjectId) {
    try {
      const { _id: classId } = await this.classroomModel.findOne({
        classTeacherId: userId,
        isActive: true,
      });
      if (!classId) {
        throw new NotFoundException('Class not found');
      }
      const leave = await this.leaveModel.aggregate([
        { $match: { classId } },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: 'userId',
            as: 'studentDetails',
          },
        },
        { $unwind: '$studentDetails' },
      ]);
      return leave;
    } catch (error) {
      throw error;
    }
  }

  async updateLeaveStatus(
    leaveId: string | Types.ObjectId,
    status: 'approved' | 'rejected',
    userId: Types.ObjectId,
  ) {
    try {
      const { _id: classId } = await this.classroomModel.findOne({
        classTeacherId: userId,
        isActive: true,
      });
      if (!classId) {
        throw new NotFoundException('Class not found');
      }
      leaveId = new Types.ObjectId(leaveId);
      const leave = await this.leaveModel.findOneAndUpdate(
        { _id: leaveId, classId },
        { $set: { status } },
      );
      const user = await this.userModel.findOne({ _id: leave.studentId });
      const fcmTokens = user.fcmToken;
      if (fcmTokens) {
        fcmTokens.forEach(async (token) => {
          await this.notificationService.sendNotification(
            token,
            'Leave Request',
            `Your leave request has been ${status}`,
          );
        });
      }
      return leave;
    } catch (error) {
      throw error;
    }
  }

  async deleteLeaveRequest(
    leaveId: string | Types.ObjectId,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      leaveId = new Types.ObjectId(leaveId);

      const leaveRequest = await this.leaveModel.findOne({
        _id: leaveId,
        studentId,
        classId,
        status: 'pending',
      });

      if (!leaveRequest) {
        throw new NotFoundException(
          'Leave request not found or cannot be deleted',
        );
      }

      const result = await this.leaveModel.deleteOne({ _id: leaveId });

      if (result.deletedCount === 0) {
        throw new BadRequestException('Failed to delete leave request');
      }

      return { message: 'Leave request deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  async createRegularizationRequest(
    createRegularizationDto: CreateRegularizationDto,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const student = await this.studentModel
        .findOne({ userId: studentId })
        .lean();
      if (!student) {
        throw new NotFoundException('Student not found');
      }

      const existingRequest = await this.attendanceRegularizationModel.findOne({
        studentId,
        classId,
        date: createRegularizationDto.date,
        status: 'pending',
      });


      if (existingRequest) {
        throw new BadRequestException(
          'A regularization request for this date is already pending',
        );
      }

      const newRegularization = new this.attendanceRegularizationModel({
        ...createRegularizationDto,
        studentId,
        classId,
        status: 'pending',
        studentName: `${student.firstName} ${student.lastName}`,
      });

      const savedRegularization = await newRegularization.save();

      return {
        message: 'Regularization request created successfully',
        regularization: savedRegularization,
      };
    } catch (error) {
      // Check if the error is a BadRequestException and rethrow it
      if (error instanceof BadRequestException) {
        throw error;
      }
      // Handle other errors
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Error creating regularization request:', error);

      throw new InternalServerErrorException(
        'Failed to create regularization request',
      );
    }
  }

  async getRegularizationRequests(
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const regularizationRequests = await this.attendanceRegularizationModel
        .find({
          studentId,
          classId,
        })
        .sort({ createdAt: -1 })
        .exec();

      if (!regularizationRequests || regularizationRequests.length === 0) {
        throw new NotFoundException(
          'No regularization requests found for this student.',
        );
      }

      return regularizationRequests;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch regularization requests.',
      );
    }
  }

  async getRegularizationRequestsTeacher(teacherId: Types.ObjectId) {
    try {
      const classroom = await this.classroomModel.findOne({
        classTeacherId: teacherId,
        isActive: true,
      });
  
      if (!classroom) {
        throw new NotFoundException('No active classroom found for this teacher.');
      }
  
      const classId = classroom._id;
  
      const regularizationRequests = await this.attendanceRegularizationModel
        .find({
          classId,
        })
        .sort({ createdAt: -1 })
        .exec();
      if (!regularizationRequests || regularizationRequests.length === 0) {
        throw new NotFoundException(
          'No regularization requests found for this class.',
        );
      }
  
      return regularizationRequests;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to fetch regularization requests.',
      );
    }
  }

  async updateRegularizationRequest(
    regularizationId: string | Types.ObjectId,
    updateRegularizationDto: Partial<CreateRegularizationDto>,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const regularizationObjectId = new Types.ObjectId(regularizationId);

      const existingRequest = await this.attendanceRegularizationModel.findOne({
        _id: regularizationObjectId,
        studentId,
        classId,
        status: 'pending',
      });

      if (!existingRequest) {
        throw new NotFoundException(
          'Regularization request not found or cannot be updated',
        );
      }

      const updatedRequest =
        await this.attendanceRegularizationModel.findByIdAndUpdate(
          regularizationObjectId,
          { $set: updateRegularizationDto },
          { new: true },
        );

      if (!updatedRequest) {
        throw new InternalServerErrorException(
          'Failed to update regularization request',
        );
      }

      return updatedRequest;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while updating the regularization request',
      );
    }
  }


  async approveOrRejectRegularizationRequest(
    regularizationId: string,
    status: 'approved' | 'rejected',
    type: 'halfDay' | 'fullDay',
    teacherId: Types.ObjectId,
  ) {
    try {
      console.log(regularizationId, status, teacherId, 'regularizationId, status, teacherId')
      const regularizationObjectId = new Types.ObjectId(regularizationId);

      // Check if the teacher is authorized to approve this request
      const classroom = await this.classroomModel.findOne({
        classTeacherId: teacherId,
        isActive: true,
      });

      if (!classroom) {
        throw new ForbiddenException('You are not authorized to approve this request');
      }

      const regularizationRequest = await this.attendanceRegularizationModel.findOne({
        _id: regularizationObjectId,
        classId: classroom._id,
      });

      if (!regularizationRequest) {
        throw new NotFoundException('Regularization request not found or already processed');
      }

      regularizationRequest.status = status;
      regularizationRequest.type = type;
      await regularizationRequest.save();

      if (status === 'approved') {
        await this.attendanceModel.updateOne(
          {
            classId: classroom._id,
            attendanceDate: regularizationRequest.date,
            'studentsAttendance.studentId': regularizationRequest.studentId,
          },
          {
            $set: {
              'studentsAttendance.$.status': type === 'halfDay' ? 'halfday' : 'present',
              'studentsAttendance.$.isRegularized': true,
            },
          }
        );
      }else{
        await this.attendanceModel.updateOne(
          {
            classId: classroom._id,
            attendanceDate: regularizationRequest.date,
            'studentsAttendance.studentId': regularizationRequest.studentId,
          },
          { $set: { 'studentsAttendance.$.status': 'absent' } }
        );
      }

      // Notify the student
      const student = await this.userModel.findById(regularizationRequest.studentId);
      if (student && student.fcmToken) {
        const notificationMessage = status === 'approved'
          ? 'Your attendance regularization request has been approved.'
          : 'Your attendance regularization request has been rejected.';
        
        student.fcmToken.forEach(async (token) => {
          await this.notificationService.sendNotification(
            token,
            'Regularization Request Update',
            notificationMessage
          );
        });
      }

      return {
        message: `Regularization request ${status}`,
        regularization: regularizationRequest,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      console.error('Error approving regularization request:', error);
      throw new InternalServerErrorException('Failed to process regularization request');
    }
  }

  async deleteRegularizationRequest(
    regularizationId: string | Types.ObjectId,
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
  ) {
    try {
      const regularizationObjectId = new Types.ObjectId(regularizationId);
  
      const existingRequest = await this.attendanceRegularizationModel.findOne({
        _id: regularizationObjectId,
        studentId,
        classId,
        status: 'pending',
      });
  
      if (!existingRequest) {
        throw new NotFoundException(
          'Regularization request not found or cannot be deleted',
        );
      }
  
      const result = await this.attendanceRegularizationModel.deleteOne({
        _id: regularizationObjectId,
      });
  
      if (result.deletedCount === 0) {
        throw new BadRequestException('Failed to delete regularization request');
      }
  
      return { message: 'Regularization request deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while deleting the regularization request',
      );
    }
  }
}
