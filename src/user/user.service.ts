import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { User } from '../domains/schema/user.schema';
import { Student } from '../domains/schema/students.schema';
import { Staff } from '../domains/schema/staff.schema';
import { Admission } from '../domains/schema/admission.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    @InjectModel(Admission.name) private admissionModel: Model<Admission>,
    @InjectConnection() private connection: Connection
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdUser = new this.userModel({
        ...createUserDto,
        roleId: new Types.ObjectId(createUserDto.roleId),
        schoolId: new Types.ObjectId(createUserDto.schoolId),
      });
      const result = await createdUser.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create user');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<User[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const users = await this.userModel.find().session(session).exec();
      await session.commitTransaction();
      return users;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch users');
    } finally {
      session.endSession();
    }
  }

  async findOne(id: string): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const user = await this.userModel.findById(id).session(session).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await session.commitTransaction();
      return user;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    } finally {
      session.endSession();
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true, session }).exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedUser;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.userModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove user');
    } finally {
      session.endSession();
    }
  }

  // Students
  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
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

  async findAllStudents(): Promise<Student[]> {
    try {
      return await this.studentModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch students');
    }
  }

  async findOneStudent(id: string): Promise<Student> {
    try {
      const student = await this.studentModel.findById(id).exec();
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
      return student;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch student');
    }
  }

  async updateStudent(id: string, updateStudentDto: CreateStudentDto): Promise<Student> {
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

  async removeStudent(id: string): Promise<void> {
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

  // Staff
  async createStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdStaff = new this.staffModel(createStaffDto);
      const result = await createdStaff.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create staff');
    } finally {
      session.endSession();
    }
  }

  async findAllStaff(): Promise<Staff[]> {
    try {
      return await this.staffModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch staff');
    }
  }

  async findOneStaff(id: string): Promise<Staff> {
    try {
      const staff = await this.staffModel.findById(id).exec();
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      return staff;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch staff');
    }
  }

  async updateStaff(id: string, updateStaffDto: CreateStaffDto): Promise<Staff> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedStaff = await this.staffModel.findByIdAndUpdate(id, updateStaffDto, { new: true, session }).exec();
      if (!updatedStaff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedStaff;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update staff');
    } finally {
      session.endSession();
    }
  }

  async removeStaff(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.staffModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove staff');
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
    try {
      return await this.admissionModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch admissions');
    }
  }

  async findOneAdmission(id: string): Promise<Admission> {
    try {
      const admission = await this.admissionModel.findById(id).exec();
      if (!admission) {
        throw new NotFoundException(`Admission with ID ${id} not found`);
      }
      return admission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch admission');
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