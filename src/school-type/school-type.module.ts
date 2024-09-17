import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolTypeController } from './school-type.controller';
import { SchoolTypeService } from './school-type.service';
import { SchoolType, SchoolTypeSchema } from '../domains/schema/school-type.schema';
import { GuardsModule } from '../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SchoolType.name, schema: SchoolTypeSchema }]),
    GuardsModule,
  ],
  controllers: [SchoolTypeController],
  providers: [SchoolTypeService],
})
export class SchoolTypeModule {}