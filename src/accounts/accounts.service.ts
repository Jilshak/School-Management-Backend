import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Account } from 'src/domains/schema/account.schema';
import { CreateAccountDto, CreatePaymentDueDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { FeeType } from 'src/domains/schema/feeType.schema';
import { PaymentDue } from 'src/domains/schema/paymentdue.schema';
import { FeeStructure } from 'src/domains/schema/fee-structure.schema';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { UpdateFeeStructureDto } from './dto/update-fee-structure.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectModel(FeeType.name) private feeModel: Model<FeeType>,
    @InjectModel(PaymentDue.name) private paymentDueModel: Model<PaymentDue>,
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructure>,
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

  async createSendDue(createPaymentDueDto: CreatePaymentDueDto,schoolId:Types.ObjectId,userId:Types.ObjectId): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }
      const temp =new this.paymentDueModel({...createPaymentDueDto,userId:new Types.ObjectId(createPaymentDueDto.userId),schoolId,createdBy:new Types.ObjectId(userId),updatedBy:new Types.ObjectId(userId)})
      
      await temp.save({session})
      if (session) {
        await session.commitTransaction();
      }
      return ;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create account');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<Account[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const accounts = await this.accountModel.find().session(session).exec();

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

  async findOne(id: string): Promise<Account> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const account = await this.accountModel.findById(id).session(session).exec();
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

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedAccount = await this.accountModel.findByIdAndUpdate(id, updateAccountDto, { new: true, session }).exec();
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

      const result = await this.accountModel.findByIdAndDelete(id).session(session).exec();
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

  async createFeeType(feeType: { name: string; amount: number; description?: string }, schoolId: Types.ObjectId): Promise<FeeType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const isExist = await this.feeModel.findOne({ name: feeType.name, schoolId }).session(session);
      if (isExist) {
        throw new Error("Fee Type Already Exists");
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

      const feeTypes = await this.feeModel.find({ schoolId,isActive:true }).session(session).exec();

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

      const feeType = await this.feeModel.findOne({ _id:new Types.ObjectId(id), schoolId }).session(session).exec();
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

  async updateFeeType(id: string, updateData: Partial<FeeType>, schoolId: Types.ObjectId): Promise<FeeType> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedFeeType = await this.feeModel.findOneAndUpdate(
        { _id:new Types.ObjectId(id), schoolId },
        updateData,
        { new: true, session }
      ).exec();

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

      const result = await this.feeModel.findOneAndUpdate({ _id:new Types.ObjectId(id), schoolId },{$set:{isActive:false}}).session(session).exec();
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

  async createFeeStructure(createFeeStructureDto: CreateFeeStructureDto, schoolId: Types.ObjectId, userId: Types.ObjectId): Promise<FeeStructure> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      // Convert fee type IDs to ObjectId
      const selectedFeeTypes = createFeeStructureDto.selectedFeeTypes.map(feeType => ({
        ...feeType,
        _id: new Types.ObjectId(feeType._id)
      }));

      const feeStructure = new this.feeStructureModel({
        ...createFeeStructureDto,
        selectedFeeTypes,
        schoolId,
        createdBy: userId,
        updatedBy: userId
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

      const feeStructures = await this.feeStructureModel.find({ schoolId }).session(session).exec();

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

  async getFeeStructureById(id: string, schoolId: Types.ObjectId): Promise<FeeStructure> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const feeStructure = await this.feeStructureModel.findOne({ _id: new Types.ObjectId(id), schoolId }).session(session).exec();
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

  async updateFeeStructure(id: string, updateFeeStructureDto: UpdateFeeStructureDto, schoolId: Types.ObjectId, userId: Types.ObjectId): Promise<FeeStructure> {
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
        updatedDto.selectedFeeTypes = updateFeeStructureDto.selectedFeeTypes.map(feeType => ({
          ...feeType,
          _id: new Types.ObjectId(feeType._id)
        }));
      }

      const updatedFeeStructure = await this.feeStructureModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), schoolId },
        { ...updatedDto, updatedBy: userId },
        { new: true, session }
      ).exec();

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

  async deleteFeeStructure(id: string, schoolId: Types.ObjectId, userId: Types.ObjectId): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.feeStructureModel.findOneAndDelete({ _id: new Types.ObjectId(id), schoolId }).session(session).exec();
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
}