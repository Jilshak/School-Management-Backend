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

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdStudent = new this.studentModel(createStudentDto);
      const result = await createdStudent.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create student');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Student[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const students = await this.studentModel.find().session(session).exec();
      await session.commitTransaction();
      return students;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch students');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<Student> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const student = await this.studentModel.findById(id).session(session).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
      await session.commitTransaction();
      return student;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch student');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedStudent = await this.studentModel.findByIdAndUpdate(id, updateStudentDto, { new: true, session }).exec();
      if (!updatedStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedStudent;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update student');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.studentModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove student');
    } finally {
      session.endSession();
    }
  }

  // Admission
  async createAdmission(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAdmission = new this.admissionModel(createAdmissionDto);
      const result = await createdAdmission.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create admission');
    } finally {
      session.endSession();
    }
  }

  async findAllAdmissions(): Promise<Admission[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const admissions = await this.admissionModel.find().session(session).exec();
      await session.commitTransaction();
      return admissions;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch admissions');
    } finally {
      session.endSession();
    }
  }

  async findOneAdmission(id: string): Promise<Admission> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const admission = await this.admissionModel.findById(id).session(session).exec();
      if (!admission) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }
      await session.commitTransaction();
      return admission;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch admission');
    } finally {
      session.endSession();
    }
  }

  async updateAdmission(id: string, updateAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedAdmission = await this.admissionModel.findByIdAndUpdate(id, updateAdmissionDto, { new: true, session }).exec();
      if (!updatedAdmission) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedAdmission;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update admission');
    } finally {
      session.endSession();
    }
  }

  async removeAdmission(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.admissionModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove admission');
    } finally {
      session.endSession();
    }
  }
}