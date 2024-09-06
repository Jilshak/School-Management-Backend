import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { LibraryService } from './library.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LendBookDto } from './dto/lend-book.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateFineDto } from './dto/create-fine.dto';
import { Book } from '../domains/schema/book.schema';
import { Reservation } from '../domains/schema/reservation.schema';
import { Fine } from '../domains/schema/fine.schema';
import { GetBooksDto } from './dto/get-books.dto';

@ApiTags('library')
@ApiBearerAuth()
@Controller('library')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('book')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Add a new book to the library' })
  @ApiResponse({ status: 201, description: 'The book has been successfully added.', type: Book })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateBookDto })
  addBook(@Body() createBookDto: CreateBookDto) {
    return this.libraryService.addBook(createBookDto);
  }

  @Get('book')
  @ApiOperation({ summary: 'Get all books in the library' })
  @ApiResponse({ status: 200, description: 'Return all books.', type: [Book] })
  getAllBooks(@Query() getBooksDto: GetBooksDto) {
    return this.libraryService.getAllBooks(getBooksDto);
  }

  @Get('book/:id')
  @ApiOperation({ summary: 'Get a book by id' })
  @ApiResponse({ status: 200, description: 'Return the book.', type: Book })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Book ID' })
  getBook(@Param('id') id: string) {
    return this.libraryService.getBook(id);
  }

  @Put('book/:id')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Update a book' })
  @ApiResponse({ status: 200, description: 'The book has been successfully updated.', type: Book })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Book ID' })
  @ApiBody({ type: UpdateBookDto })
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.libraryService.updateBook(id, updateBookDto);
  }

  @Delete('book/:id')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Remove a book from the library' })
  @ApiResponse({ status: 200, description: 'The book has been successfully removed.' })
  @ApiResponse({ status: 404, description: 'Book not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Book ID' })
  removeBook(@Param('id') id: string) {
    return this.libraryService.removeBook(id);
  }

  @Post('lend')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Lend a book to a user' })
  @ApiResponse({ status: 201, description: 'The book has been successfully lent.', type: Book })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: LendBookDto })
  lendBook(@Body() lendBookDto: LendBookDto) {
    return this.libraryService.lendBook(lendBookDto);
  }

  @Get('report')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Get library report' })
  @ApiResponse({ status: 200, description: 'Return the library report.' })
  getLibraryReport() {
    return this.libraryService.getLibraryReport();
  }

  @Get('statistics')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Get library statistics' })
  @ApiResponse({ status: 200, description: 'Return the library statistics.' })
  getLibraryStatistics() {
    return this.libraryService.getLibraryStatistics();
  }

  @Post('reservation')
  @Roles('admin', 'librarian', 'student')
  @ApiOperation({ summary: 'Create a book reservation' })
  @ApiResponse({ status: 201, description: 'The reservation has been successfully created.', type: Reservation })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateReservationDto })
  createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.libraryService.createReservation(createReservationDto);
  }

  @Get('reservation')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Get all reservations' })
  @ApiResponse({ status: 200, description: 'Return all reservations.', type: [Reservation] })
  getAllReservations() {
    return this.libraryService.findAllReservations();
  }

  @Post('fine')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Create a fine' })
  @ApiResponse({ status: 201, description: 'The fine has been successfully created.', type: Fine })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateFineDto })
  createFine(@Body() createFineDto: CreateFineDto) {
    return this.libraryService.createFine(createFineDto);
  }

  @Get('fine')
  @Roles('admin', 'librarian')
  @ApiOperation({ summary: 'Get all fines' })
  @ApiResponse({ status: 200, description: 'Return all fines.', type: [Fine] })
  getAllFines() {
    return this.libraryService.findAllFines();
  }

  @Get('digital')
  @ApiOperation({ summary: 'Get digital library' })
  @ApiResponse({ status: 200, description: 'Return the digital library.', type: [Book] })
  getDigitalLibrary() {
    return this.libraryService.getDigitalLibrary();
  }
}