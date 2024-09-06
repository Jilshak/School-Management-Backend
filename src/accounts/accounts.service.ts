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

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAccount = new this.accountModel(createAccountDto);
      const result = await createdAccount.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create account');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<Account[]> {
    try {
      return await this.accountModel.find().exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch accounts');
    }
  }

  async findOne(id: string): Promise<Account> {
    try {
      const account = await this.accountModel.findById(id).exec();
      if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }
      return account;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch account');
    }
  }

  async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
    try {
      const updatedAccount = await this.accountModel.findByIdAndUpdate(id, updateAccountDto, { new: true }).exec();
      if (!updatedAccount) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }
      return updatedAccount;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update account');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.accountModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove account');
    }
  }
}