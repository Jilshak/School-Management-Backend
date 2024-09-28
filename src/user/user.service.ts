import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types, ClientSession } from 'mongoose';
import { User } from '../domains/schema/user.schema';
import { Student } from '../domains/schema/students.schema';
import { Admission } from '../domains/schema/admission.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UserRole } from '../domains/enums/user-roles.enum';
import * as bcrypt from 'bcrypt';
import { Staff } from 'src/domains/schema/staff.schema';
import { Teacher } from 'src/domains/schema/teacher.schema';
import { Subject } from 'src/domains/schema/subject.schema';
import { Classroom } from 'src/domains/schema/classroom.schema';
import { CustomError } from '../common/errors/custom-error';
import { HttpStatus } from '@nestjs/common';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(Staff.name) private staffModel: Model<Staff>,
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Subject.name) private subjectModel: Model<Subject>,
    @InjectModel(Classroom.name) private classModel: Model<Classroom>,
    @InjectConnection() private connection: Connection,
  ) {}

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  private generateRandomUsername(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let username = '';

    // Generate 2 random capital letters
    for (let i = 0; i < 2; i++) {
      username += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    // Generate 4 random numbers
    for (let i = 0; i < 4; i++) {
      username += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    return username;
  }

  private generatePassword(): string {
    const length = 10;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
  async createUniqueUserCredentials(): Promise<{
    username: string;
    password: string;
  }> {
    let username: string;
    let isUnique = false;

    while (!isUnique) {
      username = this.generateRandomUsername();
      const existingUser = await this.userModel.findOne({ username }).exec();
      if (!existingUser) {
        isUnique = true;
      }
    }

    const password = this.generatePassword();
    return { username, password };
  }
  async create(
    createUserDto: CreateUserDto,
    schoolId?: Types.ObjectId,
  ): Promise<String> {
    let session: ClientSession | null = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Validate roles
      if (
        !Array.isArray(createUserDto.roles) ||
        createUserDto.roles.length === 0
      ) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          'At least one role must be specified',
        );
      }

      // Handle STUDENT role
      if (createUserDto.roles.includes(UserRole.STUDENT)) {
        createUserDto.roles = [UserRole.STUDENT];
      }

      // Validate SUPERADMIN creation
      if (createUserDto.roles.includes(UserRole.SUPERADMIN)) {
        if (schoolId) {
          throw new CustomError(
            HttpStatus.BAD_REQUEST,
            'Only super admin can create super admin',
          );
        }
        if (!createUserDto.schoolId) {
          throw new CustomError(
            HttpStatus.BAD_REQUEST,
            'School Id is required for super admin',
          );
        }
      }
      console.log(createUserDto);
      const { username, password } = await this.createUniqueUserCredentials();
      console.log({ username, password });
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = new this.userModel({
        username,
        password: hashedPassword,
        roles: createUserDto.roles,
        schoolId: createUserDto.roles.includes(UserRole.SUPERADMIN)
          ? undefined
          : schoolId,
        classId:
          createUserDto.roles.includes(UserRole.STUDENT) &&
          createUserDto.classId
            ? new Types.ObjectId(createUserDto.classId)
            : undefined,
      });

      const savedUser = await createdUser.save({ session });

      // Create role-specific documents
      if (!savedUser.roles.includes(UserRole.STUDENT)) {
        await this.createStaffDocument(savedUser, createUserDto, session);
      }
      if (savedUser.roles.includes(UserRole.TEACHER)) {
        await this.createTeacherDocument(savedUser, createUserDto, session);
      }
      if (savedUser.roles.includes(UserRole.STUDENT)) {
        await this.createStudentDocument(savedUser, createUserDto, session);
      }

      if (session) {
        await session.commitTransaction();
      }
      return 'User Created';
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      if (error.code === 11000 && error.keyPattern && error.keyPattern.email) {
        throw new CustomError(HttpStatus.BAD_REQUEST, 'Email already exists');
      }
      console.error('Failed to create user:', error);
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create user',
      );
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }

  // Helper methods for creating role-specific documents
  private async createStaffDocument(
    user: User,
    dto: CreateUserDto,
    session: ClientSession | null,
  ) {
    const staffData = {
      userId: user._id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      nationality: dto.nationality,
      contactNumber: dto.contactNumber,
      email: dto.email,
      address: dto.address,
      joinDate: dto.joinDate,
      department: dto.department,
      position: dto.position,
      qualifications: dto.qualifications,
      previousEmployments: dto.previousEmployments,
      schoolID: new Types.ObjectId(dto.schoolId),
      adhaarNumber: dto.adhaarNumber,
      pancardNumber: dto.pancardNumber,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactNumber: dto.emergencyContactNumber,
      pancardDocument: dto.pancardDocument,
      adhaarDocument: dto.adhaarDocument,
    };
    const createdStaff = new this.staffModel(staffData);
    await createdStaff.save({ session });
  }

  private async createTeacherDocument(
    user: User,
    dto: CreateUserDto,
    session: ClientSession | null,
  ) {
    try {
      const teacherData = {
        userId: user._id,
        subjects: dto.subjects
          ? dto.subjects.map((x) => new Types.ObjectId(x))
          : [],
      };
      const createdTeacher = new this.teacherModel(teacherData);
      await createdTeacher.save({ session });
    } catch (err) {
      throw err;
    }
  }

  private async createStudentDocument(
    user: User,
    dto: CreateUserDto,
    session: ClientSession | null,
  ) {
    try {
      const studentData = {
        userId: user._id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: dto.dateOfBirth,
        gender: dto.gender,
        nationality: dto.nationality,
        contactNumber: dto.contactNumber,
        address: dto.address,
        joinDate: dto.joinDate,
        enrollmentNumber: dto.enrollmentNumber,
        classId: new Types.ObjectId(dto.classId),
        parentsDetails: dto.parentsDetails,
        adhaarNumber: dto.adhaarNumber,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactNumber: dto.emergencyContactNumber,
        adhaarDocument: dto.adhaarDocument,
        state: dto.state,
        birthCertificateDocument: dto.birthCertificateDocument,
        tcNumber: dto.tcNumber,
        tcDocument: dto.tcDocument,
      };
      const createdStudent = new this.studentModel(studentData);
      await createdStudent.save({ session });
    } catch (err) {
      throw err;
    }
  }

  async findAll(
    roles: UserRole[],
    schoolId: Types.ObjectId,
    full: boolean = false,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      roles = Array.isArray(roles) ? roles : [roles];
      const query: any = { roles: { $in: roles }, schoolId, isActive: true };

      // Add search functionality
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { contactNumber: { $regex: search, $options: 'i' } },
        ];
      }

      const aggregatePipeline: any = [
        { $match: query },
        {
          $lookup: {
            from: 'staffs',
            localField: '_id',
            foreignField: 'userId',
            as: 'staffDetails',
          },
        },
        {
          $lookup: {
            from: 'teachers',
            localField: '_id',
            foreignField: 'userId',
            as: 'teacherDetails',
          },
        },
        {
          $lookup: {
            from: 'students',
            localField: '_id',
            foreignField: 'userId',
            as: 'studentDetails',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'classId',
            foreignField: '_id',
            as: 'classDetails',
          },
        },
        {
          $addFields: {
            firstName: '$additionalDetails.firstName',
            lastName: '$additionalDetails.lastName',
            contactNumber: '$additionalDetails.contactNumber',
            email: '$additionalDetails.email',
            // Add other fields you want to include
          },
        },
        {
          $project: {
            password: 0,
            __v: 0,
            isActive: 0,
          },
        },
      ];

      // Add search on additional fields
      if (search) {
        aggregatePipeline.push({
          $match: {
            $or: [
              { firstName: { $regex: search, $options: 'i' } },
              { lastName: { $regex: search, $options: 'i' } },
              { contactNumber: { $regex: search, $options: 'i' } },
            ],
          },
        });
      }

      const totalCount = await this.userModel
        .aggregate([...aggregatePipeline, { $count: 'total' }])
        .session(session);

      if (!full) {
        const skip = (page - 1) * limit;
        aggregatePipeline.push({ $skip: skip }, { $limit: limit });
      }

      const enhancedUsers = await this.userModel
        .aggregate(aggregatePipeline)
        .session(session);

      if (session) {
        await session.commitTransaction();
      }
      return { users: enhancedUsers, totalCount: totalCount[0]?.total || 0 };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch users',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findCount(
    roles: UserRole[],
    schoolId: Types.ObjectId,
  ): Promise<{ [key: string]: number }> {
    try {
      roles =
        typeof roles === 'undefined'
          ? [
              UserRole.ADMIN,
              UserRole.TEACHER,
              UserRole.ACCOUNTANT,
              UserRole.ADMISSION_TEAM,
              UserRole.HR,
            ]
          : Array.isArray(roles)
            ? roles
            : [roles];
      const countQuery = this.userModel.aggregate([
        {
          $match: {
            schoolId: schoolId,
            roles: { $in: roles },
            isActive: true,
          },
        },
        {
          $unwind: '$roles',
        },
        {
          $group: {
            _id: '$roles',
            count: { $sum: 1 },
          },
        },
      ]);

      const results = await countQuery.exec();

      const countByRole = {};
      roles.forEach((role) => {
        countByRole[role] = 0;
      });

      results.forEach((result) => {
        countByRole[result._id] = result.count;
      });

      return countByRole;
    } catch (err) {
      console.log(err);
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch user counts',
      );
    }
  }

  async findOne(id: string, schoolId: Types.ObjectId): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      let user: any = await this.userModel
        .findOne({ _id: new Types.ObjectId(id), schoolId, isActive: true })
        .session(session)
        .lean();

      if (!user) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `User with ID ${id} not found`,
        );
      }

      // Fetch additional details based on user roles
      if (user.roles.includes(UserRole.STUDENT)) {
        const studentDetails = await this.studentModel
          .findOne({
            userId: user._id,
          })
          .session(session)
          .lean();
        user = { ...user, ...studentDetails };
      } else {
        // For non-student roles (STAFF, TEACHER, etc.)
        const staffDetails = await this.staffModel
          .findOne({
            userId: user._id,
          })
          .session(session)
          .lean();
        user = { ...user, ...staffDetails };

        if (user.roles.includes(UserRole.TEACHER)) {
          const teacherDetails = await this.teacherModel
            .findOne({
              userId: user._id,
            })
            .session(session)
            .lean();

          if (teacherDetails) {
            // Fetch subject details
            const subjectIds = teacherDetails.subjects || [];
            const subjects = await this.subjectModel
              .find({
                _id: { $in: subjectIds },
              })
              .session(session)
              .lean();

            user = {
              ...user,
              ...teacherDetails,
              subjects: subjects,
            };
          } else {
            user.subjects = [];
          }
        }
      }

      if (session) {
        await session.commitTransaction();
      }
      return user;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch user',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    schoolId: Types.ObjectId,
  ): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Validate roles
      if (
        !Array.isArray(updateUserDto.roles) ||
        updateUserDto.roles.length === 0
      ) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          'At least one role must be specified',
        );
      }

      // Handle STUDENT role
      if (updateUserDto.roles.includes(UserRole.STUDENT)) {
        updateUserDto.roles = [UserRole.STUDENT];
      }

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          {
            $set: {
              email: updateUserDto.email,
              roles: updateUserDto.roles,
              classId: updateUserDto.roles.includes(UserRole.STUDENT)
                ? new Types.ObjectId(updateUserDto.classId)
                : undefined,
            },
          },
          { new: true, session },
        )
        .exec();

      if (!updatedUser) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `User with ID ${id} not found`,
        );
      }

      // Update role-specific documents
      if (!updatedUser.roles.includes(UserRole.STUDENT)) {
        await this.updateStaffDocument(updatedUser, updateUserDto, session);
      }
      if (updatedUser.roles.includes(UserRole.TEACHER)) {
        await this.updateTeacherDocument(updatedUser, updateUserDto, session);
      }
      if (updatedUser.roles.includes(UserRole.STUDENT)) {
        await this.updateStudentDocument(updatedUser, updateUserDto, session);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Failed to update user:', error);
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update user',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  // Helper methods for updating role-specific documents
  private async updateStaffDocument(
    user: User,
    dto: UpdateUserDto,
    session: ClientSession | null,
  ) {
    const staffData = {
      userId: user._id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      nationality: dto.nationality,
      contactNumber: dto.contactNumber,
      email: dto.email,
      address: dto.address,
      joinDate: dto.joinDate,
      department: dto.department,
      position: dto.position,
      qualifications: dto.qualifications,
      previousEmployments: dto.previousEmployments,
      schoolID: new Types.ObjectId(dto.schoolId),
      adhaarNumber: dto.adhaarNumber,
      pancardNumber: dto.pancardNumber,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactNumber: dto.emergencyContactNumber,
      pancardDocument: dto.pancardDocument,
      adhaarDocument: dto.adhaarDocument,
    };
    await this.staffModel.findOneAndUpdate(
      { userId: user._id },
      { $set: staffData },
      { upsert: true, new: true, session },
    );
  }

  private async updateTeacherDocument(
    user: User,
    dto: UpdateUserDto,
    session: ClientSession | null,
  ) {
    const teacherData = {
      userId: user._id,
      subjects: dto.subjects?.map((x) => new Types.ObjectId(x.toString())),
    };
    await this.teacherModel.findOneAndUpdate(
      { userId: user._id },
      { $set: teacherData },
      { upsert: true, new: true, session },
    );
  }

  private async updateStudentDocument(
    user: User,
    dto: UpdateUserDto,
    session: ClientSession | null,
  ) {
    const studentData = {
      userId: user._id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      nationality: dto.nationality,
      contactNumber: dto.contactNumber,
      address: dto.address,
      joinDate: dto.joinDate,
      enrollmentNumber: dto.enrollmentNumber,
      classId: new Types.ObjectId(dto.classId),
      parentsDetails: dto.parentsDetails,
      adhaarNumber: dto.adhaarNumber,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactNumber: dto.emergencyContactNumber,
      adhaarDocument: dto.adhaarDocument,
      state: dto.state,
      birthCertificateDocument: dto.birthCertificateDocument,
      tcNumber: dto.tcNumber,
      tcDocument: dto.tcDocument,
    };
    await this.studentModel.findOneAndUpdate(
      { userId: user._id },
      { $set: studentData },
      { upsert: true, new: true, session },
    );
  }

  async remove(id: string, schoolId): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      const isClassTeacher = await this.classModel.findOne({
        classTeacherId: new Types.ObjectId(id),
        isActive: true,
      });

      if (isClassTeacher) {
        throw new CustomError(
          HttpStatus.BAD_REQUEST,
          `Cannot remove user. This teacher is the class teacher of ${isClassTeacher.name}. Please change the class teacher or make the class inactive before removing this user.`,
        );
      }

      const result = await this.userModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          { $set: { isActive: false } },
        )
        .session(session)
        .exec();
      if (!result) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `User with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove user',
      );
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
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create student',
      );
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
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch students',
      );
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

      const student = await this.studentModel
        .findById(id)
        .session(session)
        .exec();
      if (!student) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `Student with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
      return student;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch student',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateStudent(
    id: string,
    updateStudentDto: CreateStudentDto,
  ): Promise<Student> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedStudent = await this.studentModel
        .findByIdAndUpdate(id, updateStudentDto, { new: true, session })
        .exec();
      if (!updatedStudent) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `Student with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedStudent;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update student',
      );
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

      const result = await this.studentModel
        .findByIdAndDelete(id)
        .session(session)
        .exec();
      if (!result) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `Student with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove student',
      );
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
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create employee',
      );
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
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch employees',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async resetPassword(
    id: string,
    resetPasswordDto: ResetPasswordDto,
    schoolId: Types.ObjectId,
  ): Promise<User> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
  
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
  
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
  
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          {
            $set: {
              username: resetPasswordDto.username,
              password: hashedPassword,
            },
          },
          { new: true, session },
        )
        .exec();
  
      if (!updatedUser) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `User with ID ${id} not found`,
        );
      }
  
      if (session) {
        await session.commitTransaction();
      }
  
      return updatedUser;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to reset password',
      );
    } finally {
      if (session) {
        await session.endSession();
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

      const employee = await this.staffModel
        .findById(id)
        .session(session)
        .exec();
      if (!employee) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `any with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
      return employee;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to fetch employee',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateEmployee(
    id: string,
    updateEmployeeDto: CreateEmployeeDto,
  ): Promise<any> {
    let session = null;
    console.log('reaching ehre alright!!');
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedEmployee = await this.staffModel
        .findByIdAndUpdate(id, updateEmployeeDto, { new: true, session })
        .exec();
      if (!updatedEmployee) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `any with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedEmployee;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to update employee',
      );
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

      const result = await this.staffModel
        .findByIdAndDelete(id)
        .session(session)
        .exec();
      if (!result) {
        throw new CustomError(
          HttpStatus.NOT_FOUND,
          `any with ID ${id} not found`,
        );
      }

      if (session) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove employee',
      );
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    if (username.length < 3) {
      return false;
    }
    const existingUser = await this.userModel.findOne({ username }).exec();
    return !existingUser;
  }
}
