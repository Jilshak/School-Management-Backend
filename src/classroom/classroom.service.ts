import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Classroom, ClassroomDocument } from '../domains/schema/classroom.schema';
import { Subject, SubjectDocument } from '../domains/schema/subject.schema';
import { TimeTable, TimeTableDocument } from '../domains/schema/timetable.schema';
import { Attendance, AttendanceDocument } from '../domains/schema/attendance.schema';
import { Syllabus, SyllabusDocument } from '../domains/schema/syllabus.schema';
import { StudyMaterial, StudyMaterialDocument } from '../domains/schema/study-material.schema';
import { Result, ResultDocument } from '../domains/schema/result.schema';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { CreateTimeTableDto } from './dto/create-time-table.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectModel(Classroom.name) private classroomModel: Model<ClassroomDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(TimeTable.name) private timeTableModel: Model<TimeTableDocument>,
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Syllabus.name) private syllabusModel: Model<SyllabusDocument>,
    @InjectModel(StudyMaterial.name) private studyMaterialModel: Model<StudyMaterialDocument>,
    @InjectModel(Result.name) private resultModel: Model<ResultDocument>,
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

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdClassroom = new this.classroomModel(createClassroomDto);
      const result = await createdClassroom.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findAll(page?: number, limit?: number): Promise<Classroom[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let query = this.classroomModel.find().session(session);
      
      if (page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }
      
      const classrooms = await query.exec();

      if (session) {
        await session.commitTransaction();
      }
      return classrooms;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch classrooms');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async findOne(id: string): Promise<Classroom> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const classroom = await this.classroomModel.findById(id).session(session).exec();
      if (!classroom) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return classroom;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const updatedClassroom = await this.classroomModel.findByIdAndUpdate(id, updateClassroomDto, { new: true, session }).exec();
      if (!updatedClassroom) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return updatedClassroom;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update classroom');
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

      const result = await this.classroomModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
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
      throw new InternalServerErrorException('Failed to remove classroom');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSubject = new this.subjectModel(createSubjectDto);
      const result = await createdSubject.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create subject');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getTimeTable(classroomId?: string, date?: string): Promise<TimeTable[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let query = this.timeTableModel.find().session(session);
      
      if (classroomId) {
        query = query.where('classroomId').equals(classroomId);
      }
      
      if (date) {
        const queryDate = new Date(date);
        query = query.where('date').equals(queryDate);
      }
      
      const timeTables = await query.populate('classroomId').exec();

      if (session) {
        await session.commitTransaction();
      }
      return timeTables;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch time table');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getTeacherTimeTable(teacherId: string, startDate?: string, endDate?: string): Promise<TimeTable[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const subjects = await this.subjectModel.find({ teacherId }).session(session).exec();
      const subjectIds = subjects.map(subject => subject._id);
      
      let query = this.timeTableModel.find({ 'schedule.subjectId': { $in: subjectIds } }).session(session);
      
      if (startDate && endDate) {
        query = query.where('date').gte(new Date(startDate).getTime()).lte(new Date(endDate).getTime());
      }
      
      const result = await query.populate('classroomId').exec();

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch teacher time table');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createTimeTable(createTimeTableDto: CreateTimeTableDto): Promise<TimeTable> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdTimeTable = new this.timeTableModel(createTimeTableDto);
      const result = await createdTimeTable.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create time table');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createAttendance(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdAttendance = new this.attendanceModel(createAttendanceDto);
      const result = await createdAttendance.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create attendance');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getAttendanceReport(classroomId: string, startDate: string, endDate: string): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const attendances = await this.attendanceModel.find({
        classroomId,
        date: { $gte: new Date(startDate), $lte: new Date(endDate) }
      }).session(session).populate('studentId').exec();

      const report = attendances.reduce((acc, attendance) => {
        const studentId = attendance.studentId.toString();
        if (!acc[studentId]) {
          acc[studentId] = { present: 0, absent: 0 };
        }
        if (attendance.isPresent) {
          acc[studentId].present++;
        } else {
          acc[studentId].absent++;
        }
        return acc;
      }, {});

      if (session) {
        await session.commitTransaction();
      }
      return report;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to generate attendance report');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async takeAttendance(takeAttendanceDto: CreateAttendanceDto[]): Promise<Attendance[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const attendances = await this.attendanceModel.create(takeAttendanceDto, { session });

      if (session) {
        await session.commitTransaction();
      }
      return attendances;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to take attendance');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getSyllabus(subjectId: string): Promise<Syllabus> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const syllabus = await this.syllabusModel.findOne({ subjectId }).session(session).exec();
      if (!syllabus) {
        throw new NotFoundException(`Syllabus for subject with ID ${subjectId} not found`);
      }

      if (session) {
        await session.commitTransaction();
      }
      return syllabus;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch syllabus');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async manageSyllabus(createSyllabusDto: CreateSyllabusDto): Promise<Syllabus> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdSyllabus = new this.syllabusModel(createSyllabusDto);
      const result = await createdSyllabus.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to manage syllabus');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async createStudyMaterial(createStudyMaterialDto: CreateStudyMaterialDto): Promise<StudyMaterial> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const createdStudyMaterial = new this.studyMaterialModel(createStudyMaterialDto);
      const result = await createdStudyMaterial.save({ session });

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to create study material');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getStudyMaterials(subjectId?: string, type?: string, page?: number, limit?: number): Promise<StudyMaterial[]> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      let query = this.studyMaterialModel.find().session(session);
      
      if (subjectId) {
        query = query.where('subjectId').equals(subjectId);
      }
      
      if (type) {
        query = query.where('type').equals(type);
      }
      
      if (page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }
      
      const result = await query.exec();

      if (session) {
        await session.commitTransaction();
      }
      return result;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new InternalServerErrorException('Failed to fetch study materials');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }

  async getStudentsPerformance(classroomId: string, subjectId?: string, startDate?: string, endDate?: string): Promise<any> {
    let session = null;
    try {
      const supportsTransactions = await this.supportsTransactions();
      
      if (supportsTransactions) {
        session = await this.connection.startSession();
        session.startTransaction();
      }

      const classroom = await this.classroomModel.findById(classroomId).populate('students').session(session).exec();
      if (!classroom) {
        throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
      }

      const studentIds = classroom.students.map(student => student._id);
      let query = this.resultModel.find({ studentId: { $in: studentIds } }).session(session);
      
      if (subjectId) {
        query = query.where('subjectId').equals(subjectId);
      }
      
      if (startDate && endDate) {
        query = query.where('date').gte(new Date(startDate).getTime()).lte(new Date(endDate).getTime());
      }
      
      const results = await query.populate('examId').exec();

      // Process results to create a performance report
      const performanceReport = studentIds.reduce((acc, studentId) => {
        const studentResults = results.filter(result => result.studentId.toString() === studentId.toString());
        acc[studentId.toString()] = {
          averageScore: studentResults.reduce((sum, result) => sum + result.score, 0) / studentResults.length || 0,
          examsTaken: studentResults.length
        };
        return acc;
      }, {});

      if (session) {
        await session.commitTransaction();
      }
      return performanceReport;
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch students performance');
    } finally {
      if (session) {
        session.endSession();
      }
    }
  }
}