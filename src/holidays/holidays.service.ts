import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Holiday, HolidayDocument } from '../domains/schema/holiday.schema';
import { School } from '../domains/schema/school.schema';
import { CreateHolidayDto, UpdateHolidayDto } from './dto/holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectModel(Holiday.name) private holidayModel: Model<HolidayDocument>,
    @InjectModel(School.name) private schoolModel: Model<School>
  ) {}

  async create(createHolidayDto: CreateHolidayDto,schoolId: Types.ObjectId): Promise<Holiday> {
    const createdHoliday = new this.holidayModel({...createHolidayDto,schoolId});
    return createdHoliday.save();
  }

  async findAll(startDate?: Date, endDate?: Date): Promise<Holiday[]> {
    let query = this.holidayModel.find();

    if (startDate && endDate) {
      query = query.where('startDate').gte(startDate.getTime()).where('endDate').lte(endDate.getTime());
    } else if (startDate) {
      query = query.where('startDate').gte(startDate.getTime());
    } else if (endDate) {
      query = query.where('endDate').lte(endDate.getTime());
    }

    return query.exec();
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayModel.findById(id).exec();
    if (!holiday) {
      throw new NotFoundException(`Holiday with ID "${id}" not found`);
    }
    return holiday;
  }

  async update(id: string, updateHolidayDto: UpdateHolidayDto): Promise<Holiday> {
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

  async updateWeeklyHolidays(schoolId: string, weeklyHolidays: number[]): Promise<number[]> {
    const updatedSchool = await this.schoolModel.findByIdAndUpdate(
      schoolId,
      { weeklyHolidays },
      { new: true }
    ).exec();

    if (!updatedSchool) {
      throw new NotFoundException(`School with ID "${schoolId}" not found`);
    }

    return updatedSchool.weeklyHolidays;
  }
}
