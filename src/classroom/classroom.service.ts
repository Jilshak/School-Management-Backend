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

  async create(createClassroomDto: CreateClassroomDto): Promise<Classroom> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdClassroom = new this.classroomModel(createClassroomDto);
      const result = await createdClassroom.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create classroom');
    } finally {
      session.endSession();
    }
  }

  async findAll(page?: number, limit?: number): Promise<Classroom[]> {
    try {
      let query = this.classroomModel.find();
      
      if (page !== undefined && limit !== undefined) {
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
      }
      
      return await query.exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch classrooms');
    }
  }

  async findOne(id: string): Promise<Classroom> {
    try {
      const classroom = await this.classroomModel.findById(id).exec();
      if (!classroom) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }
      return classroom;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch classroom');
    }
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto): Promise<Classroom> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updatedClassroom = await this.classroomModel.findByIdAndUpdate(id, updateClassroomDto, { new: true, session }).exec();
      if (!updatedClassroom) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }
      await session.commitTransaction();
      return updatedClassroom;
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update classroom');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const result = await this.classroomModel.findByIdAndDelete(id).session(session).exec();
      if (!result) {
        throw new NotFoundException(`Classroom with ID ${id} not found`);
      }
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to remove classroom');
    } finally {
      session.endSession();
    }
  }

  async createSubject(createSubjectDto: CreateSubjectDto): Promise<Subject> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdSubject = new this.subjectModel(createSubjectDto);
      const result = await createdSubject.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create subject');
    } finally {
      session.endSession();
    }
  }

  async getTimeTable(classroomId?: string, date?: string): Promise<TimeTable[]> {
    try {
      let query = this.timeTableModel.find();
      
      if (classroomId) {
        query = query.where('classroomId').equals(classroomId);
      }
      
      if (date) {
        const queryDate = new Date(date);
        query = query.where('date').equals(queryDate);
      }
      
      return await query.populate('classroomId').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch time table');
    }
  }

  async getTeacherTimeTable(teacherId: string, startDate?: string, endDate?: string): Promise<TimeTable[]> {
    try {
      const subjects = await this.subjectModel.find({ teacherId }).exec();
      const subjectIds = subjects.map(subject => subject._id);
      
      let query = this.timeTableModel.find({ 'schedule.subjectId': { $in: subjectIds } });
      
      if (startDate && endDate) {
        query = query.where('date').gte(new Date(startDate).getTime()).lte(new Date(endDate).getTime());
      }
      
      return await query.populate('classroomId').exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch teacher time table');
    }
  }

  async createTimeTable(createTimeTableDto: CreateTimeTableDto): Promise<TimeTable> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdTimeTable = new this.timeTableModel(createTimeTableDto);
      const result = await createdTimeTable.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create time table');
    } finally {
      session.endSession();
    }
  }

  async createAttendance(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdAttendance = new this.attendanceModel(createAttendanceDto);
      const result = await createdAttendance.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create attendance');
    } finally {
      session.endSession();
    }
  }

  async getAttendanceReport(classroomId: string, startDate: string, endDate: string): Promise<any> {
    try {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();

      const attendances = await this.attendanceModel.find({
        classroomId,
        date: { $gte: start, $lte: end }
      }).populate('studentId').exec();

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

      return report;
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate attendance report');
    }
  }

  async takeAttendance(takeAttendanceDto: CreateAttendanceDto[]): Promise<Attendance[]> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const attendances = await this.attendanceModel.create(takeAttendanceDto, { session });
      await session.commitTransaction();
      return attendances;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to take attendance');
    } finally {
      session.endSession();
    }
  }

  async getStudentsPerformance(classroomId: string, subjectId?: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const classroom = await this.classroomModel.findById(classroomId).populate('students').exec();
      if (!classroom) {
        throw new NotFoundException(`Classroom with ID ${classroomId} not found`);
      }

      const studentIds = classroom.students.map(student => student._id);
      let query = this.resultModel.find({ studentId: { $in: studentIds } });
      
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

      return performanceReport;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch students performance');
    }
  }

  async getSyllabus(subjectId: string): Promise<Syllabus> {
    try {
      const syllabus = await this.syllabusModel.findOne({ subjectId }).exec();
      if (!syllabus) {
        throw new NotFoundException(`Syllabus for subject with ID ${subjectId} not found`);
      }
      return syllabus;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch syllabus');
    }
  }

  async manageSyllabus(manageSyllabusDto: CreateSyllabusDto): Promise<Syllabus> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdSyllabus = new this.syllabusModel(manageSyllabusDto);
      const result = await createdSyllabus.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to manage syllabus');
    } finally {
      session.endSession();
    }
  }

  async createStudyMaterial(createStudyMaterialDto: CreateStudyMaterialDto): Promise<StudyMaterial> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const createdStudyMaterial = new this.studyMaterialModel(createStudyMaterialDto);
      const result = await createdStudyMaterial.save({ session });
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw new InternalServerErrorException('Failed to create study material');
    } finally {
      session.endSession();
    }
  }

  async getStudyMaterials(subjectId?: string, type?: string, page?: number, limit?: number): Promise<StudyMaterial[]> {
    try {
      let query = this.studyMaterialModel.find();
      
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
      
      return await query.exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch study materials');
    }
  }
}