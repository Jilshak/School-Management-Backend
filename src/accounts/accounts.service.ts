import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Account } from 'src/domains/schema/account.schema';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<Account>,
    @InjectConnection() private connection: Connection
  ) {}

  // Bill and Receipt
  async createBillReceipt(createAccountDto: CreateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAccount = new this.accountModel({ ...createAccountDto, type: 'bill_receipt' });
      const result = await createdAccount.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create bill receipt');
    } finally {
      session.endSession();
    }
  }

  async findAllBillReceipts(): Promise<Account[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const billReceipts = await this.accountModel.find({ type: 'bill_receipt' }).session(session).exec();
      await session.commitTransaction();
      return billReceipts;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch bill receipts');
    } finally {
      session.endSession();
    }
  }

  async findOneBillReceipt(id: string): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const billReceipt = await this.accountModel.findOne({ _id: id, type: 'bill_receipt' }).session(session).exec();
      if (!billReceipt) {
        throw new NotFoundException(`Bill receipt with ID ${id} not found`);
      }
      await session.commitTransaction();
      return billReceipt;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch bill receipt');
    } finally {
      session.endSession();
    }
  }

  async updateBillReceipt(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedBillReceipt = await this.accountModel.findOneAndUpdate(
        { _id: id, type: 'bill_receipt' },
        updateAccountDto,
        { new: true, session }
      ).exec();
      if (!updatedBillReceipt) {
        throw new NotFoundException(`Bill receipt with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedBillReceipt;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update bill receipt');
    } finally {
      session.endSession();
    }
  }

  async removeBillReceipt(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.accountModel.findOneAndDelete({ _id: id, type: 'bill_receipt' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Bill receipt with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove bill receipt');
    } finally {
      session.endSession();
    }
  }

  // Fee Structure
  async createFeeStructure(createAccountDto: CreateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAccount = new this.accountModel({ ...createAccountDto, type: 'fee_structure' });
      const result = await createdAccount.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create fee structure');
    } finally {
      session.endSession();
    }
  }

  async findAllFeeStructures(): Promise<Account[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const feeStructures = await this.accountModel.find({ type: 'fee_structure' }).session(session).exec();
      await session.commitTransaction();
      return feeStructures;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch fee structures');
    } finally {
      session.endSession();
    }
  }

  async findOneFeeStructure(id: string): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const feeStructure = await this.accountModel.findOne({ _id: id, type: 'fee_structure' }).session(session).exec();
      if (!feeStructure) {
        throw new NotFoundException(`Fee structure with ID ${id} not found`);
      }
      await session.commitTransaction();
      return feeStructure;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch fee structure');
    } finally {
      session.endSession();
    }
  }

  async updateFeeStructure(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedFeeStructure = await this.accountModel.findOneAndUpdate(
        { _id: id, type: 'fee_structure' },
        updateAccountDto,
        { new: true, session }
      ).exec();
      if (!updatedFeeStructure) {
        throw new NotFoundException(`Fee structure with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedFeeStructure;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update fee structure');
    } finally {
      session.endSession();
    }
  }

  async removeFeeStructure(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.accountModel.findOneAndDelete({ _id: id, type: 'fee_structure' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Fee structure with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove fee structure');
    } finally {
      session.endSession();
    }
  }

  // Student Due Date
  async createStudentDueDate(createAccountDto: CreateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAccount = new this.accountModel({ ...createAccountDto, type: 'student_due_date' });
      const result = await createdAccount.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create student due date');
    } finally {
      session.endSession();
    }
  }

  async findAllStudentDueDates(): Promise<Account[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const studentDueDates = await this.accountModel.find({ type: 'student_due_date' }).session(session).exec();
      await session.commitTransaction();
      return studentDueDates;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch student due dates');
    } finally {
      session.endSession();
    }
  }

  async findOneStudentDueDate(id: string): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const studentDueDate = await this.accountModel.findOne({ _id: id, type: 'student_due_date' }).session(session).exec();
      if (!studentDueDate) {
        throw new NotFoundException(`Student due date with ID ${id} not found`);
      }
      await session.commitTransaction();
      return studentDueDate;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch student due date');
    } finally {
      session.endSession();
    }
  }

  async updateStudentDueDate(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedStudentDueDate = await this.accountModel.findOneAndUpdate(
        { _id: id, type: 'student_due_date' },
        updateAccountDto,
        { new: true, session }
      ).exec();
      if (!updatedStudentDueDate) {
        throw new NotFoundException(`Student due date with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedStudentDueDate;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update student due date');
    } finally {
      session.endSession();
    }
  }

  async removeStudentDueDate(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.accountModel.findOneAndDelete({ _id: id, type: 'student_due_date' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Student due date with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove student due date');
    } finally {
      session.endSession();
    }
  }

  // Salary Management
  async createSalaryManagement(createAccountDto: CreateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAccount = new this.accountModel({ ...createAccountDto, type: 'salary_management' });
      const result = await createdAccount.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create salary management');
    } finally {
      session.endSession();
    }
  }

  async findAllSalaryManagements(): Promise<Account[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const salaryManagements = await this.accountModel.find({ type: 'salary_management' }).session(session).exec();
      await session.commitTransaction();
      return salaryManagements;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to fetch salary managements');
    } finally {
      session.endSession();
    }
  }

  async findOneSalaryManagement(id: string): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const salaryManagement = await this.accountModel.findOne({ _id: id, type: 'salary_management' }).session(session).exec();
      if (!salaryManagement) {
        throw new NotFoundException(`Salary management with ID ${id} not found`);
      }
      await session.commitTransaction();
      return salaryManagement;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch salary management');
    } finally {
      session.endSession();
    }
  }

  async updateSalaryManagement(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedSalaryManagement = await this.accountModel.findOneAndUpdate(
        { _id: id, type: 'salary_management' },
        updateAccountDto,
        { new: true, session }
      ).exec();
      if (!updatedSalaryManagement) {
        throw new NotFoundException(`Salary management with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedSalaryManagement;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update salary management');
    } finally {
      session.endSession();
    }
  }

  async removeSalaryManagement(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.accountModel.findOneAndDelete({ _id: id, type: 'salary_management' }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Salary management with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove salary management');
    } finally {
      session.endSession();
    }
  }

  async getAccountsReport(): Promise<any> {
    // Implement accounts report logic
    throw new Error('Method not implemented.');
  }

  async getStatistics(): Promise<any> {
    // Implement statistics logic
    throw new Error('Method not implemented.');
  }
}