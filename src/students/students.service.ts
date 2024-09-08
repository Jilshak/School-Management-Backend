import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Student } from 'src/domains/schema/students.schema';
import { Admission } from 'src/domains/schema/admission.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
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

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdStudent = new this.studentModel(createStudentDto);
      const result = await createdStudent.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create student');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Student[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const students = await this.studentModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return students;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch students');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<Student> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const student = await this.studentModel.findById(id).session(session).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return student;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch student');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedStudent = await this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true, session }).exec();
      if (!updatedStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedStudent;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update student');
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

      const result = await this.studentModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Student with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove student');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Admission methods
  async createAdmission(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
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

  async findAllAdmissions(): Promise<Admission[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const admissions = await this.admissionModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return admissions;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch admissions');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneAdmission(id: string): Promise<Admission> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const admission = await this.admissionModel.findById(id).session(session).exec();
      if (!admission) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return admission;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch admission');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateAdmission(id: string, updateAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedAdmission = await this.admissionModel.findByIdAndUpdate(id, updateAdmissionDto, { new: true, session }).exec();
      if (!updatedAdmission) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedAdmission;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update admission');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeAdmission(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.admissionModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove admission');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async patch(id: string, patchStudentDto: Partial<UpdateStudentDto>): Promise<Student> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const existingStudent = await this.studentModel.findById(id).session(session);
      if (!existingStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      Object.assign(existingStudent, patchStudentDto);
      const updatedStudent = await existingStudent.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return updatedStudent;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to patch student');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}