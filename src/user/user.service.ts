import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { User } from '../domains/schema/user.schema';
import { Student } from '../domains/schema/students.schema';
import { Admission } from '../domains/schema/admission.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UserRole } from '../domains/enums/user-roles.enum';
import * as bcrypt from "bcrypt"
import { Staff } from 'src/domains/schema/staff.schema';
import { Teacher } from 'src/domains/schema/teacher.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
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

  async create(createUserDto: CreateUserDto,schoolId?:Types.ObjectId): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      if(createUserDto.role==="superadmin" && schoolId){
        throw new Error("Only super admin can create super admin")
      }
      if(createUserDto.role!=="superadmin" && !createUserDto.schoolId){
        throw new Error("School Id not found")
      }
      const password = await bcrypt.hash(createUserDto.password,2)
      const createdUser = new this.userModel({
        email: createUserDto.email,
        password:password,
        role: createUserDto.role,
        schoolId:createUserDto.role!=="superadmin" ? new Types.ObjectId(schoolId || createUserDto.schoolId ) : undefined,
      });
      const savedUser = await createdUser.save({ session });

      if (createUserDto.role === UserRole.STUDENT) {
        // const studentData = {
        //   userId: savedUser._id,
        //   firstName: createUserDto.firstName,
        //   lastName: createUserDto.lastName,
        //   dateOfBirth: createUserDto.dateOfBirth,
        //   gender: createUserDto.gender,
        //   nationality: createUserDto.nationality,
        //   contactNumber: createUserDto.contactNumber,
        //   email: createUserDto.email,
        //   address: createUserDto.address,
        //   admissionDate: createUserDto.admissionDate,
        //   grade: createUserDto.grade,
        //   section: createUserDto.section,
        //   enrollmentNumber: createUserDto.enrollmentNumber,
        //   classID: new Types.ObjectId(createUserDto.classID),
        //   schoolID: new Types.ObjectId(createUserDto.schoolId),
        //   parentsDetails: createUserDto.parentsDetails,
        //   adhaar: createUserDto.adhaar,
        //   emergencyContactName: createUserDto.emergencyContactName,
        //   emergencyContactNumber: createUserDto.emergencyContactNumber,
        //   isActive: createUserDto.isActive,
        // };
        // const createdStudent = new this.studentModel(studentData);
        // await createdStudent.save({ session });
      } else if (createUserDto.role === UserRole.STAFF) {
        const createdStaff = new this.staffModel( {
          userId: savedUser._id,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          dateOfBirth: createUserDto.dateOfBirth,
          gender: createUserDto.gender,
          nationality: createUserDto.nationality,
          contactNumber: createUserDto.contactNumber,
          email: createUserDto.email,
          address: createUserDto.address,
          joinDate: createUserDto.joinDate,
          department: createUserDto.department,
          position: createUserDto.position,
          qualifications: createUserDto.qualifications,
          previousEmployments: createUserDto.previousEmployments,
          schoolID: new Types.ObjectId(createUserDto.schoolId),
          adhaarNumber: createUserDto.adhaarNumber,
          pancardNumber: createUserDto.pancardNumber,
          emergencyContactName: createUserDto.emergencyContactName,
          emergencyContactNumber: createUserDto.emergencyContactNumber,
          pancardDocument:createUserDto.pancardDocument,
          adhaarDocument:createUserDto.adhaarDocument
        });
        await createdStaff.save({ session });
      } else if (createUserDto.role === UserRole.TEACHER) {
        const teacherData = {
          userId: savedUser._id,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          dateOfBirth: createUserDto.dateOfBirth,
          gender: createUserDto.gender,
          nationality: createUserDto.nationality,
          contactNumber: createUserDto.contactNumber,
          address: createUserDto.address,
          joinDate: createUserDto.joinDate,
          subjects: createUserDto.subjects.map((x) => new Types.ObjectId(x.toString())),
          qualifications: createUserDto.qualifications,
          schoolID: new Types.ObjectId(createUserDto.schoolId),
          adhaarNumber: createUserDto.adhaarNumber,
          pancardNumber: createUserDto.pancardNumber,
          emergencyContactName: createUserDto.emergencyContactName,
          emergencyContactNumber: createUserDto.emergencyContactNumber,
          pancardDocument:createUserDto.pancardDocument,
          adhaarDocument:createUserDto.adhaarDocument
        };
        const createdTeacher = new this.teacherModel(teacherData);
        await createdTeacher.save({ session });
      }

      if (session) {
        await session.commitTransaction();
      }
      return savedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new BadRequestException('Email already exists');
      }
      console.log(error)
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

  // Employees
  async createEmployee(createEmployeeDto: CreateEmployeeDto): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdEmployee = new this.staffModel(createEmployeeDto);
      const result = await createdEmployee.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create employee');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllEmployees(): Promise<any[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const employees = await this.staffModel.find().session(session).exec();

      if (session) {
        await session.commitTransaction();
      }
      return employees;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch employees');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneEmployee(id: string): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const employee = await this.staffModel.findById(id).session(session).exec();
      if (!employee) {
        throw new NotFoundException(`any with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return employee;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch employee');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateEmployee(id: string, updateEmployeeDto: CreateEmployeeDto): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedEmployee = await this.staffModel.findByIdAndUpdate(id, updateEmployeeDto, { new: true, session }).exec();
      if (!updatedEmployee) {
        throw new NotFoundException(`any with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedEmployee;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update employee');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeEmployee(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.staffModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`any with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove employee');
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