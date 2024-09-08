import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Admission } from '../domains/schema/admission.schema';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';

@Injectable()
export class AdmissionService {
  constructor(
    @InjectModel(Admission.name) private admissionModel: Model<Admission>,
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

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdAdmission = new this.admissionModel(createAdmissionDto);
      const result = await createdAdmission.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create admission');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Admission[]> {
    return this.admissionModel.find().exec();
  }

  async findOne(id: string): Promise<Admission> {
    const admission = await this.admissionModel.findById(id).exec();
    if (!admission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return admission;
  }

  async update(id: string, updateAdmissionDto: UpdateAdmissionDto): Promise<Admission> {
    const updatedAdmission = await this.admissionModel.findByIdAndUpdate(id, updateAdmissionDto, { new: true }).exec();
    if (!updatedAdmission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return updatedAdmission;
  }

  async remove(id: string): Promise<void> {
    const result = await this.admissionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
  }

  // You might want to add methods to handle admission fee, userId, and studentId
  async updateAdmissionFee(id: string, admissionFee: number): Promise<Admission> {
    const updatedAdmission = await this.admissionModel.findByIdAndUpdate(
      id,
      { admissionFee },
      { new: true }
    ).exec();
    if (!updatedAdmission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return updatedAdmission;
  }

  async linkStudentId(id: string, studentId: string): Promise<Admission> {
    const updatedAdmission = await this.admissionModel.findByIdAndUpdate(
      id,
      { studentId },
      { new: true }
    ).exec();
    if (!updatedAdmission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return updatedAdmission;
  }
}