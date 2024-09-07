import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SchoolTypeController } from './school-type.controller';
import { SchoolTypeService } from './school-type.service';
import { SchoolType, SchoolTypeSchema } from '../domains/schema/school-type.schema';
import { RolesGuard } from '../shared/guards/roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SchoolType.name, schema: SchoolTypeSchema }]),
  ],
  controllers: [SchoolTypeController],
  providers: [SchoolTypeService, RolesGuard],
})
export class SchoolTypeModule {}