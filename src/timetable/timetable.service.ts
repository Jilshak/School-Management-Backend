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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createTimetableDto: CreateTimetableDto): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdTimetable = new this.timetableModel(createTimetableDto);
      const result = await createdTimetable.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create timetable');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<TimeTable[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const timetables = await this.timetableModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return timetables;
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

  async findOne(id: string): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const timetable = await this.timetableModel.findById(id).session(session).exec();
      if (!timetable) {
        throw new NotFoundException(`Timetable with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return timetable;
    } catch (error) {
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

  async update(id: string, updateTimetableDto: UpdateTimetableDto): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedTimetable = await this.timetableModel.findByIdAndUpdate(
        id, 
        updateTimetableDto, 
        { new: true, session }
      ).exec();
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

      const result = await this.timetableModel.findByIdAndDelete(id).session(session).exec();
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