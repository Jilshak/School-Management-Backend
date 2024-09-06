import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { School } from 'src/domains/schema/school.schema';
import { Class } from 'src/domains/schema/class.schema';
import { Section } from 'src/domains/schema/section.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Types } from 'mongoose';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
    @InjectConnection() private connection: Connection
  ) {}

  // School CRUD operations
  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdSchool = new this.schoolModel(createSchoolDto);
      const result = await createdSchool.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create school');
    } finally {
      session.endSession();
    }
  }

  async findAll(): Promise<School[]> {
    return this.schoolModel.find().exec();
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolModel.findById(id).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return school;
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    const updatedSchool = await this.schoolModel.findByIdAndUpdate(id, updateSchoolDto, { new: true }).exec();
    if (!updatedSchool) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
    return updatedSchool;
  }

  async remove(id: string): Promise<void> {
    const result = await this.schoolModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`School with ID ${id} not found`);
    }
  }

  // Class operations
  async createClass(schoolId: string, createClassDto: CreateClassDto): Promise<Class> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const school = await this.schoolModel.findById(schoolId).session(session);
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const createdClass = new this.classModel({ ...createClassDto, schoolId });
      const result = await createdClass.save({ session });

      school.classes.push(result._id as unknown as Types.ObjectId);
      await school.save({ session });

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create class');
    } finally {
      session.endSession();
    }
  }

  async findAllClasses(schoolId: string): Promise<Class[]> {
    const school = await this.schoolModel.findById(schoolId).populate('classes').exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }
    return school.classes as unknown as Class[];
  }

  async findOneClass(schoolId: string, id: string): Promise<Class> {
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    const classObj = await this.classModel.findOne({ _id: id, schoolId }).exec();
    if (!classObj) {
      throw new NotFoundException(`Class with ID ${id} not found in school ${schoolId}`);
    }

    return classObj;
  }

  async updateClass(schoolId: string, id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    const school = await this.schoolModel.findById(schoolId).exec();
    if (!school) {
      throw new NotFoundException(`School with ID ${schoolId} not found`);
    }

    const updatedClass = await this.classModel.findOneAndUpdate({ _id: id, schoolId }, updateClassDto, { new: true }).exec();
    if (!updatedClass) {
      throw new NotFoundException(`Class with ID ${id} not found in school ${schoolId}`);
    }

    return updatedClass;
  }

  async removeClass(schoolId: string, id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const school = await this.schoolModel.findById(schoolId).session(session);
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const result = await this.classModel.findOneAndDelete({ _id: id, schoolId }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Class with ID ${id} not found in school ${schoolId}`);
      }

      school.classes = school.classes.filter(classId => classId.toString() !== id);
      await school.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove class');
    } finally {
      session.endSession();
    }
  }

  // Section operations
  async createSection(schoolId: string, classId: string, createSectionDto: CreateSectionDto): Promise<Section> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const school = await this.schoolModel.findById(schoolId).session(session);
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const classObj = await this.classModel.findOne({ _id: classId, schoolId }).session(session);
      if (!classObj) {
        throw new NotFoundException(`Class with ID ${classId} not found in school ${schoolId}`);
      }

      const createdSection = new this.sectionModel({ ...createSectionDto, classId, schoolId });
      const result = await createdSection.save({ session });

      classObj.sections.push(result._id as unknown as Types.ObjectId);
      await classObj.save({ session });

      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create section');
    } finally {
      session.endSession();
    }
  }

  async findAllSections(schoolId: string, classId: string): Promise<Section[]> {
    const classObj = await this.classModel.findOne({ _id: classId, schoolId }).populate('sections').exec();
    if (!classObj) {
      throw new NotFoundException(`Class with ID ${classId} not found in school ${schoolId}`);
    }
    return classObj.sections as unknown as Section[];
  }

  async findOneSection(schoolId: string, classId: string, id: string): Promise<Section> {
    const section = await this.sectionModel.findOne({ _id: id, classId, schoolId }).exec();
    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found in class ${classId} of school ${schoolId}`);
    }
    return section;
  }

  async updateSection(schoolId: string, classId: string, id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const updatedSection = await this.sectionModel.findOneAndUpdate({ _id: id, classId, schoolId }, updateSectionDto, { new: true }).exec();
    if (!updatedSection) {
      throw new NotFoundException(`Section with ID ${id} not found in class ${classId} of school ${schoolId}`);
    }
    return updatedSection;
  }

  async removeSection(schoolId: string, classId: string, id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const classObj = await this.classModel.findOne({ _id: classId, schoolId }).session(session);
      if (!classObj) {
        throw new NotFoundException(`Class with ID ${classId} not found in school ${schoolId}`);
      }

      const result = await this.sectionModel.findOneAndDelete({ _id: id, classId, schoolId }).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Section with ID ${id} not found in class ${classId} of school ${schoolId}`);
      }

      classObj.sections = classObj.sections.filter(sectionId => sectionId.toString() !== id);
      await classObj.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove section');
    } finally {
      session.endSession();
    }
  }
}