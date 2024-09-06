import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { Book } from 'src/domains/schema/book.schema';
import { Reservation } from 'src/domains/schema/reservation.schema';
import { Fine } from 'src/domains/schema/fine.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LendBookDto } from './dto/lend-book.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateFineDto } from './dto/create-fine.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Fine.name) private fineModel: Model<Fine>,
    @InjectConnection() private connection: Connection
  ) {}

  // Manage Books
  async createBook(createBookDto: CreateBookDto): Promise<Book> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdBook = new this.bookModel(createBookDto);
      const result = await createdBook.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create book');
    } finally {
      session.endSession();
    }
  }

  async findAllBooks(): Promise<Book[]> {
    return this.bookModel.find().exec();
  }

  async findOneBook(id: string): Promise<Book> {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return book;
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const updatedBook = await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true }).exec();
    if (!updatedBook) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    return updatedBook;
  }

  async removeBook(id: string): Promise<void> {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
  }

  // Library Report
  async getLibraryReport(): Promise<any> {
    // Implement library report logic
    const totalBooks = await this.bookModel.countDocuments();
    const lentBooks = await this.bookModel.countDocuments({ status: 'lent' });
    const availableBooks = await this.bookModel.countDocuments({ status: 'available' });

    return {
      totalBooks,
      lentBooks,
      availableBooks,
    };
  }

  // Lend a Book
  async lendBook(lendBookDto: LendBookDto): Promise<Book> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const book = await this.bookModel.findById(lendBookDto.bookId).session(session);
      if (!book) {
        throw new NotFoundException(`Book with ID ${lendBookDto.bookId} not found`);
      }
      if (book.status !== 'available') {
        throw new Error('Book is not available for lending');
      }

      book.status = 'lent';
      book.lentTo = new Types.ObjectId(lendBookDto.userId);
      book.lentDate = new Date();
      book.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

      const updatedBook = await book.save({ session });
      await session.commitTransaction();
      return updatedBook;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to lend book');
    } finally {
      session.endSession();
    }
  }

  // Library Statistics
  async getLibraryStatistics(): Promise<any> {
    const totalBooks = await this.bookModel.countDocuments();
    const lentBooks = await this.bookModel.countDocuments({ status: 'lent' });
    const reservedBooks = await this.reservationModel.countDocuments();
    const totalFines = await this.fineModel.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
      totalBooks,
      lentBooks,
      reservedBooks,
      totalFines: totalFines[0]?.total || 0,
    };
  }

  // Book Reservation
  async createReservation(createReservationDto: CreateReservationDto): Promise<Reservation> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const book = await this.bookModel.findById(createReservationDto.bookId).session(session);
      if (!book) {
        throw new NotFoundException(`Book with ID ${createReservationDto.bookId} not found`);
      }

      const reservation = new this.reservationModel(createReservationDto);
      const result = await reservation.save({ session });

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create reservation');
    } finally {
      session.endSession();
    }
  }

  async findAllReservations(): Promise<Reservation[]> {
    return this.reservationModel.find().exec();
  }

  // Fines
  async createFine(createFineDto: CreateFineDto): Promise<Fine> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const fine = new this.fineModel(createFineDto);
      const result = await fine.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create fine');
    } finally {
      session.endSession();
    }
  }

  async findAllFines(): Promise<Fine[]> {
    return this.fineModel.find().exec();
  }

  // Digital Library
  async getDigitalLibrary(): Promise<Book[]> {
    return this.bookModel.find({ format: 'digital' }).exec();
  }
}