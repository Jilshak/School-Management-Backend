import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { TimeTable, TimeTableDocument } from '../domains/schema/timetable.schema';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(
    @InjectModel(TimeTable.name) private timetableModel: Model<TimeTableDocument>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createTimetableDto: CreateTimetableDto): Promise<TimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdTimetable = new this.timetableModel(createTimetableDto);
      const result = await createdTimetable.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create timetable');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<TimeTable[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const timetables = await this.timetableModel.find().session(session).exec();
      await session.commitTransaction();
      return timetables;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch timetables');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<TimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const timetable = await this.timetableModel.findById(id).session(session).exec();
      if (!timetable) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
      }
      await session.commitTransaction();
      return timetable;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch timetable');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateTimetableDto: UpdateTimetableDto): Promise<TimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedTimetable = await this.timetableModel.findByIdAndUpdate(
        id, 
        updateTimetableDto, 
        { new: true, session }
      ).exec();
      if (!updatedTimetable) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedTimetable;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update timetable');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.timetableModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove timetable');
    } finally {
      session.endSession();
    }
  }
}