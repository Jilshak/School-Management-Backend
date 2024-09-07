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

  private async supportsTransactions(): Promise<boolean> {
    try {
      await this.connection.db.admin().command({ replSetGetStatus: 1 });
      return true;
    } catch (e) {
      return false;
    }
  }

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdAccount = new this.accountModel(createAccountDto);
      const result = await createdAccount.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
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
}