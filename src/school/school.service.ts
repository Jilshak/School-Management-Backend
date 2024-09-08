import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { School } from 'src/domains/schema/school.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
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

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSchool = new this.schoolModel(createSchoolDto);
      const result = await createdSchool.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<School[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const schools = await this.schoolModel.find().exec();

      if (session) {
        await session.commitTransaction();
      }
      return schools;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch schools');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(id).exec();
      if (!school) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return school;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedSchool = await this.schoolModel.findByIdAndUpdate(id, updateSchoolDto, { new: true }).exec();
      if (!updatedSchool) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedSchool;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async patch(id: string, patchSchoolDto: Partial<UpdateSchoolDto>): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const existingSchool = await this.schoolModel.findById(id).exec();
      if (!existingSchool) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      Object.assign(existingSchool, patchSchoolDto);

      const updatedSchool = await existingSchool.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return updatedSchool;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to patch school');
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

      const result = await this.schoolModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`School with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}