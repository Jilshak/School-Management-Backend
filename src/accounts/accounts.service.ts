import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Account } from 'src/domains/schema/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FeeType } from 'src/domains/schema/feeType.schema';
import { PaymentDue } from 'src/domains/schema/paymentdue.schema';
import { FeeStructure } from 'src/domains/schema/fee-structure.schema';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';
import { CreatePaymentDueDto } from './dto/create-payment-due.dto';
import { UpdatePaymentDueDto } from './dto/update-payment-due.dto';
import { User } from 'src/domains/schema/user.schema';
import { Student } from 'src/domains/schema/students.schema';
import * as fs from 'fs';
import * as path from 'path';
import { generateReciept } from 'src/domains/pdfTemplates/billAndReciept';
import { School } from 'src/domains/schema/school.schema';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(FeeType.name) private feeModel: Model<FeeType>,
    @InjectModel(PaymentDue.name) private paymentDueModel: Model<PaymentDue>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(FeeStructure.name)
    private feeStructureModel: Model<FeeStructure>,
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

  async create(
    createAccountDto: CreateAccountDto,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      createAccountDto.fees = createAccountDto.fees.map((fee: any) => ({
        ...fee,
        duePaymentId: fee.duePaymentId
          ? new Types.ObjectId(fee.duePaymentId)
          : undefined,
        dueDateId: fee.dueDateId
          ? new Types.ObjectId(fee.dueDateId)
          : undefined,
        feeTypeId: fee.feeTypeId
          ? new Types.ObjectId(fee.feeTypeId)
          : undefined,
      }));
      createAccountDto.studentId = new Types.ObjectId(
        createAccountDto.studentId,
      );
      const temp = new this.accountModel({
        ...createAccountDto,
        schoolId,
        createdBy: new Types.ObjectId(userId),
        updatedBy: new Types.ObjectId(userId),
      });

      await temp.save({ session });
      if (session) {
        await session.commitTransaction();
      }
      return;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      console.log(error);
      throw new InternalServerErrorException('Failed to create account');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(
    schoolId: Types.ObjectId,
    isActive: boolean = true,
  ): Promise<Account[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const accounts = await this.accountModel
        .aggregate([
          { $match: { schoolId } },
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: 'userId',
              as: 'student',
            },
          },
          {
            $lookup: {
              from: 'staffs',
              localField: 'createdBy',
              foreignField: 'userId',
              as: 'createdStaff',
            },
          },
          {
            $lookup: {
              from: 'staffs',
              localField: 'updatedBy',
              foreignField: 'userId',
              as: 'updatedStaff',
            },
          },
        ])
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return accounts;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch accounts');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findById(
    id: string,
    schoolId: Types.ObjectId,
    isActive: boolean = true,
  ): Promise<Account[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const [accounts] = await this.accountModel
        .aggregate([
          { $match: { schoolId,_id:new Types.ObjectId(id) } },
          {
            $lookup: {
              from: 'students',
              localField: 'studentId',
              foreignField: 'userId',
              as: 'student',
            },
          },
          { $unwind: '$student' },
          {
            $lookup: {
              from: 'staffs',
              localField: 'createdBy',
              foreignField: 'userId',
              as: 'createdStaff',
            },
          },
          {
            $lookup: {
              from: 'staffs',
              localField: 'updatedBy',
              foreignField: 'userId',
              as: 'updatedStaff',
            },
          },
        ])
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return accounts;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch accounts');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findByStudentId(
    id: string | Types.ObjectId,
    schoolId: Types.ObjectId,
    isActive: boolean = true,
  ): Promise<Account[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const accounts = await this.accountModel
        .aggregate([
          { $match: { schoolId,studentId:new Types.ObjectId(id) } },
        ])
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return accounts;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch accounts');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateAccount(id: string, updateAccountDto: UpdateAccountDto, schoolId: Types.ObjectId, userId: Types.ObjectId) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      updateAccountDto.fees = updateAccountDto.fees.map((fee: any) => ({
        ...fee,
        duePaymentId: fee.duePaymentId
          ? new Types.ObjectId(fee.duePaymentId)
          : undefined,
        dueDateId: fee.dueDateId
          ? new Types.ObjectId(fee.dueDateId)
          : undefined,
        feeTypeId: fee.feeTypeId
          ? new Types.ObjectId(fee.feeTypeId)
          : undefined,
      }));
      updateAccountDto.studentId = new Types.ObjectId(
        updateAccountDto.studentId,
      );
      const account = await this.accountModel.updateOne({_id:new Types.ObjectId(id),schoolId},{...updateAccountDto,updatedBy:new Types.ObjectId(userId)})
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      return account
    }catch(err){
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to update account');
    }finally{
      if (session) {
        session.endSession();
      }
    }

  }
  async generatePaymentReciept(id: string, schoolId: Types.ObjectId) {
    try {
      const [accounts] = await this.accountModel.aggregate([
        { $match: { schoolId, _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: 'students',
            localField: 'studentId',
            foreignField: 'userId',
            as: 'student',
          },
        },
        { $unwind: '$student' },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'student.classId',
            foreignField: '_id',
            as: 'classes',
          },
        },
        { $unwind: '$classes' },
        {
          $lookup: {
            from: 'staffs',
            localField: 'createdBy',
            foreignField: 'userId',
            as: 'createdStaff',
          },
        },
        {
          $lookup: {
            from: 'staffs',
            localField: 'updatedBy',
            foreignField: 'userId',
            as: 'updatedStaff',
          },
        },
      ]);

      const paymentDetails = accounts.fees.map((fee: any) => ({
        name: fee.dueDateId ? fee.name + ' (Payment Due)' : fee.name,
        quantity: fee.quantity || 1,
        description: fee.description || 'N/A',
        unitPrice: fee.amount,
      }));
      const school = await this.schoolModel.findById(schoolId);
      const html = await generateReciept(
        paymentDetails,
        accounts.paymentDate,
        accounts.paymentMode || 'N/A',
        accounts.student.address || 'N/A',
        accounts.classes.name +
          ' (' +
          accounts.classes.academicYear.startDate.getFullYear() +
          '-' +
          accounts.classes.academicYear.endDate
            .getFullYear()
            .toString()
            .slice(-2) +
          ')',
        accounts.student.firstName + ' ' + accounts.student.lastName,
        {
          address: school.address,
          email: school.email,
          logo: school.schoolLogo,
          name: school.name,
          phone: school.primaryPhone,
        },
        accounts._id.toString()
      );
      return html;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Failed to generate payment reciept',
      );
    }
  }

  async findOne(id: string): Promise<Account> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const account = await this.accountModel
        .findById(id)
        .session(session)
        .exec();
      if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return account;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch account');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedAccount = await this.accountModel
        .findByIdAndUpdate(id, updateAccountDto, { new: true, session })
        .exec();
      if (!updatedAccount) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedAccount;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update account');
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

      const result = await this.accountModel
        .findByIdAndDelete(id)
        .session(session)
        .exec();
      if (!result) {
        throw new NotFoundException(`Account with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove account');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createFeeType(
    feeType: { name: string; amount: number; description?: string },
    schoolId: Types.ObjectId,
  ): Promise<FeeType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const isExist = await this.feeModel
        .findOne({ name: feeType.name, schoolId })
        .session(session);
      if (isExist) {
        throw new Error('Fee Type Already Exists');
      }

      const fee = new this.feeModel({ ...feeType, schoolId });
      const result = await fee.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create fee type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getFeeTypes(schoolId: Types.ObjectId): Promise<FeeType[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const feeTypes = await this.feeModel
        .find({ schoolId, isActive: true })
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return feeTypes;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch fee types');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getFeeTypeById(id: string, schoolId: Types.ObjectId): Promise<FeeType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const feeType = await this.feeModel
        .findOne({ _id: new Types.ObjectId(id), schoolId })
        .session(session)
        .exec();
      if (!feeType) {
        throw new NotFoundException(`Fee Type with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return feeType;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch fee type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateFeeType(
    id: string,
    updateData: Partial<FeeType>,
    schoolId: Types.ObjectId,
  ): Promise<FeeType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedFeeType = await this.feeModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          updateData,
          { new: true, session },
        )
        .exec();

      if (!updatedFeeType) {
        throw new NotFoundException(`Fee Type with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedFeeType;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update fee type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async deleteFeeType(id: string, schoolId: Types.ObjectId): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.feeModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          { $set: { isActive: false } },
        )
        .session(session)
        .exec();
      if (!result) {
        throw new NotFoundException(`Fee Type with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to delete fee type');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createFeeStructure(
    createFeeStructureDto: CreateFeeStructureDto,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<FeeStructure> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Convert fee type IDs to ObjectId
      const selectedFeeTypes = createFeeStructureDto.selectedFeeTypes.map(
        (feeType) => ({
          ...feeType,
          _id: new Types.ObjectId(feeType._id),
        }),
      );

      const feeStructure = new this.feeStructureModel({
        ...createFeeStructureDto,
        selectedFeeTypes,
        schoolId,
        createdBy: userId,
        updatedBy: userId,
      });
      const result = await feeStructure.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create fee structure');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getFeeStructures(schoolId: Types.ObjectId): Promise<FeeStructure[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const feeStructures = await this.feeStructureModel
        .find({ schoolId })
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return feeStructures;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch fee structures');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getFeeStructureById(
    id: string,
    schoolId: Types.ObjectId,
  ): Promise<FeeStructure> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const feeStructure = await this.feeStructureModel
        .findOne({ _id: new Types.ObjectId(id), schoolId })
        .session(session)
        .exec();
      if (!feeStructure) {
        throw new NotFoundException(`Fee Structure with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return feeStructure;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch fee structure');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateFeeStructure(
    id: string,
    updateFeeStructureDto: UpdateFeeStructureDto,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<FeeStructure> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Convert fee type IDs to ObjectId if present in the update DTO
      let updatedDto = { ...updateFeeStructureDto };
      if (updateFeeStructureDto.selectedFeeTypes) {
        updatedDto.selectedFeeTypes =
          updateFeeStructureDto.selectedFeeTypes.map((feeType) => ({
            ...feeType,
            _id: new Types.ObjectId(feeType._id),
          }));
      }

      const updatedFeeStructure = await this.feeStructureModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          { ...updatedDto, updatedBy: userId },
          { new: true, session },
        )
        .exec();

      if (!updatedFeeStructure) {
        throw new NotFoundException(`Fee Structure with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedFeeStructure;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update fee structure');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async deleteFeeStructure(
    id: string,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.feeStructureModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), schoolId })
        .session(session)
        .exec();
      if (!result) {
        throw new NotFoundException(`Fee Structure with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to delete fee structure');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createPaymentDue(
    createPaymentDueDto: CreatePaymentDueDto,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const paymentDues = createPaymentDueDto.students.map((studentId) => ({
        userId: new Types.ObjectId(studentId),
        name: createPaymentDueDto.name,
        feeDetails: createPaymentDueDto.feeDetails.map((detail) => ({
          feeType: detail.feeType,
          name: detail.description,
          amount: detail.amount,
          count: detail.count,
          description: detail.description,
        })),
        dueDate: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          createPaymentDueDto.dueDate,
        ),
        isPaid: false,
        createdBy: userId,
        updatedBy: userId,
        schoolId: schoolId,
      }));

      const result = await this.paymentDueModel.insertMany(paymentDues, {
        session,
      });
      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      console.log(error);
      throw new InternalServerErrorException('Failed to create payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getPaymentDues(schoolId: Types.ObjectId): Promise<any[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const paymentDues = await this.paymentDueModel
        .aggregate([
          {
            $match: { schoolId: new Types.ObjectId(schoolId) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'user.classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },
          {
            $unwind: '$classroom',
          },
          {
            $lookup: {
              from: 'students',
              localField: 'user._id',
              foreignField: 'userId',
              as: 'student',
            },
          },
          {
            $unwind: '$student',
          },
          {
            $lookup: {
              from: 'feetypes',
              localField: 'feeDetails.feeType',
              foreignField: '_id',
              as: 'feeTypeDetails',
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      {
                        feeTypeName: {
                          $let: {
                            vars: {
                              matchedFeeType: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$feeTypeDetails',
                                      cond: {
                                        $eq: [
                                          '$$this._id',
                                          '$$feeDetail.feeType',
                                        ],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                            in: '$$matchedFeeType.name',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      { name: '$$feeDetail.feeTypeName' },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              dueDate: 1,
              totalAmount: 1,
              feeDetails: 1,
              status: 1,
              'user._id': 1,
              'user.username': 1,
              'user.roles': 1,
              'classroom._id': 1,
              'classroom.name': 1,
              'student._id': 1,
              'student.firstName': 1,
              'student.lastName': 1,
              'student.enrollmentNumber': 1,
              'student.parentsDetails': 1,
            },
          },
        ])
        .session(session)
        .exec();

      if (session) {
        await session.commitTransaction();
      }
      return paymentDues;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch payment dues');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getPaymentDueById(id: string, schoolId: Types.ObjectId): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const [paymentDue] = await this.paymentDueModel
        .aggregate([
          {
            $match: {
              _id: new Types.ObjectId(id),
              schoolId: new Types.ObjectId(schoolId),
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'user.classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },
          {
            $unwind: '$classroom',
          },
          {
            $lookup: {
              from: 'students',
              localField: 'user._id',
              foreignField: 'userId',
              as: 'student',
            },
          },
          {
            $unwind: '$student',
          },
          {
            $lookup: {
              from: 'feetypes',
              localField: 'feeDetails.feeType',
              foreignField: '_id',
              as: 'feeTypeDetails',
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      {
                        feeTypeName: {
                          $let: {
                            vars: {
                              matchedFeeType: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$feeTypeDetails',
                                      cond: {
                                        $eq: [
                                          '$$this._id',
                                          '$$feeDetail.feeType',
                                        ],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                            in: '$$matchedFeeType.name',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      { name: '$$feeDetail.feeTypeName' },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              dueDate: 1,
              totalAmount: 1,
              feeDetails: 1,
              status: 1,
              'user._id': 1,
              'user.username': 1,
              'user.roles': 1,
              'classroom._id': 1,
              'classroom.name': 1,
              'student._id': 1,
              'student.firstName': 1,
              'student.lastName': 1,
              'student.enrollmentNumber': 1,
              'student.parentsDetails': 1,
            },
          },
        ])
        .session(session)
        .exec();

      if (!paymentDue) {
        throw new NotFoundException(`Payment Due with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return paymentDue;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getPaymentDueBalanceByStudentId(
    userId: string | Types.ObjectId,
    schoolId: Types.ObjectId,
  ): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      userId = new Types.ObjectId(userId);
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const paymentDue = await this.paymentDueModel
        .aggregate([
          {
            $match: { userId, schoolId: new Types.ObjectId(schoolId) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'user.classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },
          {
            $unwind: '$classroom',
          },
          {
            $lookup: {
              from: 'students',
              localField: 'user._id',
              foreignField: 'userId',
              as: 'student',
            },
          },
          {
            $unwind: '$student',
          },
          {
            $lookup: {
              from: 'feetypes',
              localField: 'feeDetails.feeType',
              foreignField: '_id',
              as: 'feeTypeDetails',
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      {
                        feeTypeName: {
                          $let: {
                            vars: {
                              matchedFeeType: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$feeTypeDetails',
                                      cond: {
                                        $eq: [
                                          '$$this._id',
                                          '$$feeDetail.feeType',
                                        ],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                            in: '$$matchedFeeType.name',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      { name: '$$feeDetail.feeTypeName' },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              dueDate: 1,
              totalAmount: 1,
              feeDetails: 1,
              status: 1,
              'user._id': 1,
              'user.username': 1,
              'user.roles': 1,
              'classroom._id': 1,
              'classroom.name': 1,
              'student._id': 1,
              'student.firstName': 1,
              'student.lastName': 1,
              'student.enrollmentNumber': 1,
              'student.parentsDetails': 1,
            },
          },
        ])
        .session(session)
        .exec();

      const duePaymentIds = paymentDue.flatMap(due => due.feeDetails.map(fee => fee._id));

      const accounts = await this.accountModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            studentId: new Types.ObjectId(userId),
            "fees.duePaymentId": { $in: duePaymentIds }
          },
        },
        {
          $unwind: "$fees"
        },
        {
          $match: {
            "fees.duePaymentId": { $in: duePaymentIds.map(id => new Types.ObjectId(id)) }
          }
        },
        {
          $group: {
            _id: "$fees.duePaymentId",
            totalPaid: { $sum: "$fees.amount" }
          }
        }
      ]);
       
    
        const calculateBalance = paymentDue.map((dues) => {
          const balanceDues = dues.feeDetails.map((fee) => {
            const paidAmount = accounts.find(account => account._id.toString() === fee._id.toString())?.totalPaid || 0;
            const remainingBalance = fee.amount * fee.count - paidAmount;
            return {
              ...fee,
              paidAmount,
              remainingBalance
            };
          });

          return {
            ...dues,
            feeDetails: balanceDues,
            totalRemainingBalance: balanceDues.reduce((sum, fee) => sum + fee.remainingBalance, 0)
          };
        });

      if (!paymentDue) {
        throw new NotFoundException(`Payment Due with ID ${userId} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return calculateBalance;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getPaymentDueByStudentId(
    userId: string | Types.ObjectId,
    schoolId: Types.ObjectId,
  ): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      userId = new Types.ObjectId(userId);
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const paymentDue = await this.paymentDueModel
        .aggregate([
          {
            $match: { userId, schoolId: new Types.ObjectId(schoolId) },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $lookup: {
              from: 'classrooms',
              localField: 'user.classId',
              foreignField: '_id',
              as: 'classroom',
            },
          },
          {
            $unwind: '$classroom',
          },
          {
            $lookup: {
              from: 'students',
              localField: 'user._id',
              foreignField: 'userId',
              as: 'student',
            },
          },
          {
            $unwind: '$student',
          },
          {
            $lookup: {
              from: 'feetypes',
              localField: 'feeDetails.feeType',
              foreignField: '_id',
              as: 'feeTypeDetails',
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      {
                        feeTypeName: {
                          $let: {
                            vars: {
                              matchedFeeType: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: '$feeTypeDetails',
                                      cond: {
                                        $eq: [
                                          '$$this._id',
                                          '$$feeDetail.feeType',
                                        ],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                            in: '$$matchedFeeType.name',
                          },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
          {
            $addFields: {
              feeDetails: {
                $map: {
                  input: '$feeDetails',
                  as: 'feeDetail',
                  in: {
                    $mergeObjects: [
                      '$$feeDetail',
                      { name: '$$feeDetail.feeTypeName' },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              dueDate: 1,
              totalAmount: 1,
              feeDetails: 1,
              status: 1,
              'user._id': 1,
              'user.username': 1,
              'user.roles': 1,
              'classroom._id': 1,
              'classroom.name': 1,
              'student._id': 1,
              'student.firstName': 1,
              'student.lastName': 1,
              'student.enrollmentNumber': 1,
              'student.parentsDetails': 1,
            },
          },
        ])
        .session(session)
        .exec();

      if (!paymentDue) {
        throw new NotFoundException(`Payment Due with ID ${userId} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return paymentDue;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updatePaymentDue(
    id: string,
    updatePaymentDueDto: UpdatePaymentDueDto,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<PaymentDue> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedPaymentDue = await this.paymentDueModel
        .findOneAndUpdate(
          { _id: new Types.ObjectId(id), schoolId },
          { ...updatePaymentDueDto, updatedBy: userId },
          { new: true, session },
        )
        .exec();

      if (!updatedPaymentDue) {
        throw new NotFoundException(`Payment Due with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedPaymentDue;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async deletePaymentDue(
    id: string,
    schoolId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();

      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.paymentDueModel
        .findOneAndDelete({ _id: new Types.ObjectId(id), schoolId })
        .session(session)
        .exec();
      if (!result) {
        throw new NotFoundException(`Payment Due with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to delete payment due');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}
