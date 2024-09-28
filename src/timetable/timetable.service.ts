import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import {
  TimeTable,
  TimeTableDocument,
} from '../domains/schema/timetable.schema';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { User } from 'src/domains/schema/user.schema';
import { UserRole } from 'src/domains/enums/user-roles.enum';

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(TimeTable.name)
    private timetableModel: Model<TimeTableDocument>,
    @InjectConnection() private connection: Connection,
    @InjectModel(User.name)
    private userModel: Model<User>,
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
    createTimetableDto: CreateTimetableDto,
    schoolId: Types.ObjectId,
  ): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const modifiedDto = this.convertIdsToObjectId(
        createTimetableDto,
        schoolId,
      );
      await this.checkTeacherConflicts(modifiedDto, schoolId,new Types.ObjectId(createTimetableDto.classId) ,session);

      // Filter out days with empty schedules
      const filteredDto = this.filterEmptyDays(modifiedDto);

      const filter = { classId: filteredDto.classId, schoolId: filteredDto.schoolId };
      const update = { $set: filteredDto };
      const options = { upsert: true, new: true, session };

      const result = await this.timetableModel.findOneAndUpdate(filter, update, options);

      if (session) await session.commitTransaction();
      return result;
    } catch (error) {
      if (session) await session.abortTransaction();
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerErrorException('Failed to create or update timetable');
    } finally {
      if (session) session.endSession();
    }
  }

  private convertIdsToObjectId(
    dto: CreateTimetableDto,
    schoolId: Types.ObjectId,
  ) {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    return {
      ...dto,
      schoolId,
      classId: new Types.ObjectId(dto.classId),
      ...Object.fromEntries(
        days.map((day) => [
          day,
          dto[day]?.map((slot) => ({
            ...slot,
            startTime: Number(slot.startTime),
            endTime: Number(slot.endTime),
            subjectId: new Types.ObjectId(slot.subjectId),
            teacherId: new Types.ObjectId(slot.teacherId),
          })) || [],
        ]),
      ),
    };
  }

  private filterEmptyDays(dto: any): any {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const filteredDays = days.filter(day => dto[day] && dto[day].length > 0);
    
    return {
      ...dto,
      ...Object.fromEntries(filteredDays.map(day => [day, dto[day]]))
    };
  }

  private async checkTeacherConflicts(
    dto: any,
    schoolId: Types.ObjectId,
    classId: Types.ObjectId,
    session: any,
  ) {
    try {
      const days = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      for (const day of days) {
        for (const slot of dto[day]) {
          const conflict = await this.timetableModel
            .findOne({
              schoolId,
              classId: { $ne: classId },
              [day]: {
                $elemMatch: {
                  teacherId: slot.teacherId,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                },
              },
            })
            .session(session);

          if (conflict) {
            throw new Error(
              `Teacher ${slot.teacherId} is already assigned on ${day} from ${slot.startTime} to ${slot.endTime}`,
            );
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async findAvailableTeacher(startTime: number, endTime: number, subjectId: string, schoolId: Types.ObjectId, classId: string): Promise<User[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Find all teachers who teach the given subject
      const teachers = await this.userModel.aggregate([
        {
          $match: {
            roles: UserRole.TEACHER,
            schoolId: schoolId,
            isActive: true
          }
        },
        {
          $lookup: {
            from: 'teachers',
            localField: '_id',
            foreignField: 'userId',
            as: 'teacherDetails'
          }
        },
        {
          $unwind: '$teacherDetails'
        },
        {
          $match: {
            'teacherDetails.subjects': new Types.ObjectId(subjectId)
          }
        },
        {
          $lookup: {
            from: 'staffs',
            localField: '_id',
            foreignField: 'userId',
            as: 'staffDetails'
          }
        },
        {
          $unwind: '$staffDetails'
        },
        {
          $project: {
            _id: 1,
            firstName: "$staffDetails.firstName",
            lastName: "$staffDetails.lastName",
            email: "$staffDetails.email",
            roles: 1,
            'teacherDetails.subjects': 1,
            'staffDetails.employeeId': 1,
          }
        }
      ]).session(session);

      // Find all timetables that have slots conflicting with the given time
      const conflictingTimetables = await this.timetableModel.find({
        schoolId: schoolId,
        classId: { $ne: new Types.ObjectId(classId) },
        $or: [
          { monday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } },
          { tuesday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } },
          { wednesday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } },
          { thursday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } },
          { friday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } },
          { saturday: { $elemMatch: { $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
            { startTime: { $gte: startTime, $lt: endTime } },
            { endTime: { $gt: startTime, $lte: endTime } }
          ] } } }
        ]
      }).session(session);

      // Get the IDs of teachers who are not available
      const unavailableTeacherIds = conflictingTimetables.flatMap(timetable => 
        Object.values(timetable.toObject())
          .filter(Array.isArray)
          .flat()
          .filter(slot => slot && slot.teacherId)
          .map(slot => slot.teacherId.toString())
      );

      // Filter out unavailable teachers
      const availableTeachers = teachers.filter(teacher => 
        !unavailableTeacherIds.includes(teacher._id.toString())
      );

      if (session) {
        await session.commitTransaction();
      }
      return availableTeachers;
    } catch (error) {
      console.log(error)
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to find available staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(schoolId: Types.ObjectId, page?: number, limit?: number, full?: boolean): Promise<{ timetables: any[], total?: number, page?: number, limit?: number }> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      const aggregationPipeline:any = [
        { $match: { schoolId: schoolId } },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classroomDetails'
          }
        },
        { $unwind: '$classroomDetails' },
        // Lookup stages for teachers and subjects for each day
        ...days.flatMap(day => [
          {
            $lookup: {
              from: 'users',
              localField: `${day}.teacherId`,
              foreignField: '_id',
              as: `${day}Teachers`
            }
          },
          {
            $lookup: {
              from: 'subjects',
              localField: `${day}.subjectId`,
              foreignField: '_id',
              as: `${day}Subjects`
            }
          }
        ]),
        {
          $project: {
            classId: 1,
            classroomDetails: 1,
            // Project stages for each day
            ...Object.fromEntries(days.map(day => [
              day,
              {
                $map: {
                  input: `$${day}`,
                  as: 'slot',
                  in: {
                    $mergeObjects: [
                      '$$slot',
                      {
                        teacher: { $arrayElemAt: [`$${day}Teachers`, { $indexOfArray: [`$${day}.teacherId`, '$$slot.teacherId'] }] },
                        subject: { $arrayElemAt: [`$${day}Subjects`, { $indexOfArray: [`$${day}.subjectId`, '$$slot.subjectId'] }] }
                      }
                    ]
                  }
                }
              }
            ]))
          }
        }
      ];

      if (!full) {
        const total = await this.timetableModel.countDocuments({ schoolId });
        page = page || 1;
        limit = limit || 10;
        const skip = (page - 1) * limit;

        aggregationPipeline.push({ $skip: skip }, { $limit: limit });

        const timetables = await this.timetableModel.aggregate(aggregationPipeline).session(session);

        if (session) {
          await session.commitTransaction();
        }
        return { timetables, total, page, limit };
      } else {
        const timetables = await this.timetableModel.aggregate(aggregationPipeline).session(session);

        if (session) {
          await session.commitTransaction();
        }
        return { timetables };
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch timetables');
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

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const aggregationPipeline: any = [
      { $match: { classId: new Types.ObjectId(id), schoolId: schoolId } },
      {
        $lookup: {
          from: 'classrooms',
          localField: 'classId',
          foreignField: '_id',
          as: 'classroomDetails'
        }
      },
      { $unwind: '$classroomDetails' },
      // Perform lookups for each day in a consistent manner
      ...days.flatMap(day => [
        // Lookup teacher details from the 'users' collection
        {
          $lookup: {
            from: 'users',
            localField: `${day}.teacherId`,
            foreignField: '_id',
            as: `${day}Teachers`
          }
        },
        // Lookup additional teacher details from the 'staffs' collection
        {
          $lookup: {
            from: 'staffs',
            localField: `${day}.teacherId`,
            foreignField: 'userId',
            as: `${day}TeacherDetails`
          }
        },
        // Lookup subjects
        {
          $lookup: {
            from: 'subjects',
            localField: `${day}.subjectId`,
            foreignField: '_id',
            as: `${day}Subjects`
          }
        }
      ])
    ];

    const [timetable] = await this.timetableModel.aggregate(aggregationPipeline).session(session);
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    daysOfWeek.forEach(day => {
      if (timetable[day] && timetable[day].length > 0) {
        timetable[day] = timetable[day].map(period => {
          const teacherIndex = timetable[`${day}Teachers`].findIndex(teacher => teacher._id.buffer.toString() === period.teacherId.buffer.toString());
          const teacherDetailsIndex = timetable[`${day}TeacherDetails`].findIndex(detail => detail.userId.buffer.toString() === period.teacherId.buffer.toString());
          const subjectIndex = timetable[`${day}Subjects`].findIndex(subject => subject._id.buffer.toString() === period.subjectId.buffer.toString());

          return {
            ...period,
            teacher: timetable[`${day}TeacherDetails`][teacherDetailsIndex],
            subject: timetable[`${day}Subjects`][subjectIndex]
          };
        });
      }
    });
    if (!timetable) {
      throw new NotFoundException(`Timetable for class with ID ${id} not found`);
    }

    if (session) {
      await session.commitTransaction();
    }
    return timetable;
  } catch (error) {
    console.log(error)
    if (session) {
      await session.abortTransaction();
    }
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to fetch timetable');
  } finally {
    if (session) {
      session.endSession();
    }
  }
}


  async update(
    id: string,
    updateTimetableDto: UpdateTimetableDto,
  ): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedTimetable = await this.timetableModel
        .findByIdAndUpdate(id, updateTimetableDto, { new: true, session })
        .exec();
      if (!updatedTimetable) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedTimetable;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update timetable');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async remove(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.timetableModel
        .findByIdAndDelete(id)
        .session(session)
        .exec();
      if (!result) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove timetable');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}
