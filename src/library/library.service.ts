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
import { GetBooksDto } from './dto/get-books.dto';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Reservation.name) private reservationModel: Model<Reservation>,
    @InjectModel(Fine.name) private fineModel: Model<Fine>,
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

  async addBook(createBookDto: CreateBookDto): Promise<Book> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdBook = new this.bookModel(createBookDto);
      const result = await createdBook.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to add book');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getAllBooks(getBooksDto: GetBooksDto): Promise<Book[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const { title, author, isbn, page = 1, limit = 10 } = getBooksDto;
      const query = this.bookModel.find().session(session);

      if (title) {
        query.where('title').regex(new RegExp(title, 'i'));
      }
      if (author) {
        query.where('author').regex(new RegExp(author, 'i'));
      }
      if (isbn) {
        query.where('isbn').equals(isbn);
      }

      const skip = (page - 1) * limit;
      const books = await query.skip(skip).limit(limit).exec();

      if (session) {
        await session.commitTransaction();
      }

      return books;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch books');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getBook(id: string): Promise<Book> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const book = await this.bookModel.findById(id).session(session).exec();
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }

      return book;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch book');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateBook(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedBook = await this.bookModel.findByIdAndUpdate(id, updateBookDto, { new: true }).session(session).exec();
      if (!updatedBook) {
        throw new NotFoundException(`Book with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }

      return updatedBook;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update book');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeBook(id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const result = await this.bookModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Book with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove book');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async lendBook(lendBookDto: LendBookDto): Promise<Book> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const book = await this.bookModel.findById(lendBookDto.bookId).session(session).exec();
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to lend book');
    } finally {
      session.endSession();
    }
  }

  async getLibraryReport(): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const totalBooks = await this.bookModel.countDocuments().session(session);
      const lentBooks = await this.bookModel.countDocuments({ status: 'lent' }).session(session);
      const availableBooks = await this.bookModel.countDocuments({ status: 'available' }).session(session);

      if (session) {
        await session.commitTransaction();
      }

      return {
        totalBooks,
        lentBooks,
        availableBooks,
      };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to generate library report');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

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

  async createReservation(createReservationDto: CreateReservationDto): Promise<Reservation> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const book = await this.bookModel.findById(createReservationDto.bookId).session(session).exec();
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

  async createFine(createFineDto: CreateFineDto): Promise<Fine> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

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

  async getDigitalLibrary(): Promise<Book[]> {
    return this.bookModel.find({ format: 'digital' }).exec();
  }
}