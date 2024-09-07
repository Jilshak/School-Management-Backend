import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { School } from 'src/domains/schema/school.schema';
import { Class } from 'src/domains/schema/class.schema';
import { Section } from 'src/domains/schema/section.schema';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectModel(School.name) private schoolModel: Model<School>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    @InjectModel(Section.name) private sectionModel: Model<Section>,
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

  async create(createSchoolDto: CreateSchoolDto): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSchool = new this.schoolModel(createSchoolDto);
      const result = await createdSchool.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(): Promise<School[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const schools = await this.schoolModel.find().exec();

      if (session) {
        await session.commitTransaction();
      }
      return schools;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch schools');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(id).exec();
      if (!school) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return school;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateSchoolDto: UpdateSchoolDto): Promise<School> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedSchool = await this.schoolModel.findByIdAndUpdate(id, updateSchoolDto, { new: true }).exec();
      if (!updatedSchool) {
        throw new NotFoundException(`School with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedSchool;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update school');
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

      const result = await this.schoolModel.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundException(`School with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove school');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createClass(schoolId: string, createClassDto: CreateClassDto): Promise<Class> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(schoolId).session(session);
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const createdClass = new this.classModel({ ...createClassDto, schoolId: new Types.ObjectId(schoolId) });
      const result = await createdClass.save({ session }) as Class & { _id: Types.ObjectId };

      school.classes.push(result._id);
      await school.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create class');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllClasses(schoolId: string): Promise<Class[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(schoolId).populate('classes').exec();
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return school.classes as unknown as Class[];
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch classes');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneClass(schoolId: string, id: string): Promise<Class> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(schoolId).exec();
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const classObj = await this.classModel.findOne({ _id: id, schoolId }).exec();
      if (!classObj) {
        throw new NotFoundException(`Class with ID ${id} not found in school ${schoolId}`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return classObj;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch class');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateClass(schoolId: string, id: string, updateClassDto: UpdateClassDto): Promise<Class> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const school = await this.schoolModel.findById(schoolId).exec();
      if (!school) {
        throw new NotFoundException(`School with ID ${schoolId} not found`);
      }

      const updatedClass = await this.classModel.findOneAndUpdate({ _id: id, schoolId }, updateClassDto, { new: true }).exec();
      if (!updatedClass) {
        throw new NotFoundException(`Class with ID ${id} not found in school ${schoolId}`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedClass;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update class');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeClass(schoolId: string, id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

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
      throw new InternalServerErrorException('Failed to remove class');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createSection(schoolId: string, classId: string, createSectionDto: CreateSectionDto): Promise<Section> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const classObj = await this.classModel.findOne({
        _id: new Types.ObjectId(classId),
        schoolId: new Types.ObjectId(schoolId)
      }).session(session);

      if (!classObj) {
        throw new NotFoundException(`Class with ID ${classId} not found in school ${schoolId}`);
      }

      const createdSection = new this.sectionModel({
        ...createSectionDto,
        classId: new Types.ObjectId(classId),
        schoolId: new Types.ObjectId(schoolId)
      });
      const result = await createdSection.save({ session }) as Section & { _id: Types.ObjectId };

      classObj.sections.push(result._id);
      await classObj.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create section');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAllSections(schoolId: string, classId: string): Promise<Section[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const classObj = await this.classModel.findOne({ _id: classId, schoolId }).populate('sections').exec();
      if (!classObj) {
        throw new NotFoundException(`Class with ID ${classId} not found in school ${schoolId}`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return classObj.sections as unknown as Section[];
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch sections');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOneSection(schoolId: string, classId: string, id: string): Promise<Section> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const section = await this.sectionModel.findOne({ _id: id, classId, schoolId }).exec();
      if (!section) {
        throw new NotFoundException(`Section with ID ${id} not found in class ${classId} of school ${schoolId}`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return section;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch section');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async updateSection(schoolId: string, classId: string, id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedSection = await this.sectionModel.findOneAndUpdate({ _id: id, classId, schoolId }, updateSectionDto, { new: true }).exec();
      if (!updatedSection) {
        throw new NotFoundException(`Section with ID ${id} not found in class ${classId} of school ${schoolId}`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedSection;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update section');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async removeSection(schoolId: string, classId: string, id: string): Promise<void> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

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
      throw new InternalServerErrorException('Failed to remove section');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}