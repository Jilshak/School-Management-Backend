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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdUser = new this.userModel({
        ...createUserDto,
        schoolId: new Types.ObjectId(createUserDto.schoolId),
      });
      const result = await createdUser.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create user');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<User[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const users = await this.userModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return users;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch users');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const user = await this.userModel.findById(id).session(session).exec();
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return user;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true, session }).exec();
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
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

      const result = await this.userModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`User with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove user');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Students
  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
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

  async findAllStudents(): Promise<Student[]> {
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

  async findOneStudent(id: string): Promise<Student> {
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

  async updateStudent(id: string, updateStudentDto: CreateStudentDto): Promise<Student> {
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

  async removeStudent(id: string): Promise<void> {
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

  // Staff
  async createStaff(createStaffDto: CreateStaffDto): Promise<Staff> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdStaff = new this.staffModel(createStaffDto);
      const result = await createdStaff.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllStaff(): Promise<Staff[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const staff = await this.staffModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return staff;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneStaff(id: string): Promise<Staff> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const staff = await this.staffModel.findById(id).session(session).exec();
      if (!staff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return staff;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateStaff(id: string, updateStaffDto: CreateStaffDto): Promise<Staff> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedStaff = await this.staffModel.findByIdAndUpdate(id, updateStaffDto, { new: true, session }).exec();
      if (!updatedStaff) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedStaff;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeStaff(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.staffModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Staff with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove staff');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Admission
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
}