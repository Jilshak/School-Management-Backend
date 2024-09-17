import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { Book, BookSchema } from 'src/domains/schema/book.schema';
import { Reservation, ReservationSchema } from 'src/domains/schema/reservation.schema';
import { Fine, FineSchema } from 'src/domains/schema/fine.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Reservation.name, schema: ReservationSchema },
      { name: Fine.name, schema: FineSchema },
    ]),
    GuardsModule,
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}