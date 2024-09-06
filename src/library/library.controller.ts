import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { LendBookDto } from './dto/lend-book.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateFineDto } from './dto/create-fine.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('library')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('book')
  @Roles('admin', 'librarian')
  createBook(@Body() createBookDto: CreateBookDto) {
    return this.libraryService.createBook(createBookDto);
  }

  @Get('book')
  @Roles('admin', 'librarian', 'teacher', 'student')
  findAllBooks() {
    return this.libraryService.findAllBooks();
  }

  @Get('book/:id')
  @Roles('admin', 'librarian', 'teacher', 'student')
  findOneBook(@Param('id') id: string) {
    return this.libraryService.findOneBook(id);
  }

  @Put('book/:id')
  @Roles('admin', 'librarian')
  updateBook(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.libraryService.updateBook(id, updateBookDto);
  }

  @Delete('book/:id')
  @Roles('admin', 'librarian')
  removeBook(@Param('id') id: string) {
    return this.libraryService.removeBook(id);
  }

  @Post('lend')
  @Roles('admin', 'librarian')
  lendBook(@Body() lendBookDto: LendBookDto) {
    return this.libraryService.lendBook(lendBookDto);
  }

  @Post('reservation')
  @Roles('admin', 'librarian', 'teacher', 'student')
  createReservation(@Body() createReservationDto: CreateReservationDto) {
    return this.libraryService.createReservation(createReservationDto);
  }

  @Post('fine')
  @Roles('admin', 'librarian')
  createFine(@Body() createFineDto: CreateFineDto) {
    return this.libraryService.createFine(createFineDto);
  }
}