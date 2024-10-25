import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Holiday, HolidayDocument } from '../domains/schema/holiday.schema';
import { School } from '../domains/schema/school.schema';
import { Classroom } from '../domains/schema/classroom.schema';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Classroom.name) private classroomModel: Model<Classroom>,
  ) {}

  async create(
    createHolidayDto: CreateHolidayDto,
    schoolId: Types.ObjectId,
  ): Promise<Holiday> {
    const createdHoliday = new this.holidayModel({
      ...createHolidayDto,
      schoolId,
    });
    return createdHoliday.save();
  }

  async findAll(startDate?: Date, endDate?: Date, schoolId?: Types.ObjectId): Promise<any[]> {
    const matchStage: any = { schoolId };

    if (startDate && endDate) {
      matchStage.startDate = { $gte: startDate };
      matchStage.endDate = { $lte: endDate };
    } else if (startDate) {
      matchStage.startDate = { $gte: startDate };
    } else if (endDate) {
      matchStage.endDate = { $lte: endDate };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'classrooms',
          localField: 'exceptionClassrooms',
          foreignField: '_id',
          as: 'exceptionClassroomDetails'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          startDate: 1,
          endDate: 1,
          description: 1,
          isActive: 1,
          schoolId: 1,
          exceptionClassrooms: 1,
          exceptionClassroomDetails: {
            _id: 1,
            name: 1,
            classTeacherId: 1,
            subjects: 1,
            academicYear: 1,
            isActive: 1
          }
        }
      }
    ];

    return this.holidayModel.aggregate(pipeline).exec();
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayModel.findById(id).exec();
    if (!holiday) {
      throw new NotFoundException(`Holiday with ID "${id}" not found`);
    }
    return holiday;
  }

  async update(
    id: string,
    updateHolidayDto: UpdateHolidayDto,
  ): Promise<Holiday> {
    const updatedHoliday = await this.holidayModel
      .findByIdAndUpdate(id, updateHolidayDto, { new: true })
      .exec();
    if (!updatedHoliday) {
      throw new NotFoundException(`Holiday with ID "${id}" not found`);
    }
    return updatedHoliday;
  }

  async remove(id: string): Promise<Holiday> {
    const deletedHoliday = await this.holidayModel.findByIdAndDelete(id).exec();
    if (!deletedHoliday) {
      throw new NotFoundException(`Holiday with ID "${id}" not found`);
    }
    return deletedHoliday;
  }

  async getWeeklyHolidays(schoolId: string): Promise<number[]> {
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID "${schoolId}" not found`);
    }
    return school.weeklyHolidays;
  }

  async updateExceptionHolidays(
    schoolId: Types.ObjectId,
    id: string,
    exceptionClassrooms: Types.ObjectId[],
  ) {
    const updatedHoliday = await this.holidayModel
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id), schoolId },
        { $set: { exceptionClassrooms:exceptionClassrooms.map(id=>new Types.ObjectId(id)) } },
        { new: true }
      )
      .populate('exceptionClassrooms', 'name classTeacherId subjects academicYear isActive')
      .exec();

    if (!updatedHoliday) {
      throw new NotFoundException(`Holiday with ID "${id}" not found`);
    }
    return updatedHoliday;
  }

  async updateWeeklyHolidays(
    schoolId: string,
    weeklyHolidays: number[],
  ): Promise<number[]> {
    const updatedSchool = await this.schoolModel
      .findByIdAndUpdate(schoolId, { weeklyHolidays }, { new: true })
      .exec();

    if (!updatedSchool) {
      throw new NotFoundException(`School with ID "${schoolId}" not found`);
    }

    return updatedSchool.weeklyHolidays;
  }
}
