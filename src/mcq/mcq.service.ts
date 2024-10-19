import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MCQ } from 'src/domains/schema/mcq.schema';
import { CreateMCQDto } from './dto/create-mcq.dto';
import { UpdateMCQDto } from './dto/update-mcq.dto';
import { Syllabus } from 'src/domains/schema/syllabus.schema';

@Injectable()
export class McqService {
  constructor(
    @InjectModel(MCQ.name) private readonly mcqModel: Model<MCQ>,
    @InjectModel(Syllabus.name) private readonly syllabusModel: Model<Syllabus>
  ) {}

  async create(
    createMcqDto: CreateMCQDto,
    schoolId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ): Promise<MCQ> {
    try {
      schoolId = new Types.ObjectId(schoolId);
      const createdMcq = new this.mcqModel({
        ...createMcqDto,
        chapterId: new Types.ObjectId(createMcqDto.chapterId),
        syllabusId: new Types.ObjectId(createMcqDto.syllabusId),
        subjectId: new Types.ObjectId(createMcqDto.subjectId),
        schoolId,
        createdBy: userId,
        updatedBy: userId,
      });
      return await createdMcq.save();
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(schoolId: string | Types.ObjectId) {
    try {
      const mcqs = await this.mcqModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        {
          $lookup: {
            from: 'syllabuses',
            localField: 'syllabusId',
            foreignField: '_id',
            as: 'syllabus',
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subject',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'syllabus.assignedClasses',
            foreignField: '_id',
            as: 'classes',
          },
        },
        {
          $project: {
            _id: 1,
            question: 1,
            options: 1,
            correctAnswer: 1,
            syllabusName: { $arrayElemAt: ['$syllabus.syllabusName', 0] },
            subjectName: { $arrayElemAt: ['$subject.name', 0] },
            chapterId: 1,
            chapterName: {
              $let: {
                vars: {
                  subject: { $arrayElemAt: ['$syllabus.subjects', 0] },
                },
                in: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$$subject.chapters',
                        as: 'chapter',
                        cond: { $eq: ['$$chapter._id', '$chapterId'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            classes: {
              $map: {
                input: '$classes',
                as: 'class',
                in: {
                  _id: '$$class._id',
                  name: '$$class.name',
                },
              },
            },
            isActive: 1,
            createdBy: 1,
            updatedBy: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ]);

      return mcqs;
    } catch (err) {
      throw err;
    }
  }

  async findSyllabusById(
    syllabusId: string | Types.ObjectId,
    schoolId: string | Types.ObjectId,
  ) {
    try {
      const syllabus = await this.syllabusModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(syllabusId),
            schoolId: new Types.ObjectId(schoolId),
          },
        },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjects.subjectId',
            foreignField: '_id',
            as: 'subjectDetails',
          },
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'assignedClasses',
            foreignField: '_id',
            as: 'classes',
          },
        },
        {
          $project: {
            syllabusName: 1,
            subjects: {
              $map: {
                input: '$subjects',
                as: 'subject',
                in: {
                  subjectId: '$$subject.subjectId',
                  subjectName: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$subjectDetails',
                              as: 'sd',
                              cond: { $eq: ['$$sd._id', '$$subject.subjectId'] },
                            },
                          },
                          as: 'filteredSubject',
                          in: '$$filteredSubject.name',
                        },
                      },
                      0,
                    ],
                  },
                  chapters: '$$subject.chapters',
                },
              },
            },
            classes: {
              $map: {
                input: '$classes',
                as: 'class',
                in: {
                  _id: '$$class._id',
                  name: '$$class.name',
                },
              },
            },
          },
        },
      ]);

      if (!syllabus.length) {
        throw new Error('Syllabus not found');
      }

      const syllabusData = syllabus[0];

      const mcqs = await this.mcqModel.find({
        syllabusId: new Types.ObjectId(syllabusId),
        schoolId: new Types.ObjectId(schoolId),
      }).exec();

      const result = {
        syllabusId: syllabusData._id,
        syllabusName: syllabusData.syllabusName,
        subjects: syllabusData.subjects.map(subject => ({
          subjectId: subject.subjectId,
          subjectName: subject.subjectName,
          chapters: subject.chapters.map(chapter => ({
            chapterId: chapter._id,
            chapterName: chapter.chapterName,
            questions: mcqs.filter(mcq => 
              mcq.chapterId.toString() === chapter._id.toString()
            ) || [],
          })),
        })),
        classes: syllabusData.classes,
      };

      return [result];
    } catch (err) {
      throw err;
    }
  }

  async update(
    id: string | Types.ObjectId,
    updateMcqDto: UpdateMCQDto,
    schoolId: string | Types.ObjectId,
    userId: string | Types.ObjectId,
  ) {
    try {
      if (updateMcqDto.syllabusId) {
        updateMcqDto.syllabusId = new Types.ObjectId(updateMcqDto.syllabusId);
      }
      if (updateMcqDto.subjectId) {
        updateMcqDto.subjectId = new Types.ObjectId(updateMcqDto.subjectId);
      }
      if (updateMcqDto.chapterId) {
        updateMcqDto.chapterId = new Types.ObjectId(updateMcqDto.chapterId);
      }
      const updatedMcq = await this.mcqModel.updateOne(
        { _id: new Types.ObjectId(id), schoolId: new Types.ObjectId(schoolId) },
        { $set:{...updateMcqDto, updatedBy: new Types.ObjectId(userId)} },
      );
      if (!updatedMcq) {
        throw new Error('MCQ not found');
      }
      return updatedMcq;
    } catch (err) {
      throw err;
    }
  }

  async delete(id: string | Types.ObjectId, schoolId: string | Types.ObjectId) {
    try {
      const deletedMcq = await this.mcqModel.deleteOne({ _id: new Types.ObjectId(id), schoolId: new Types.ObjectId(schoolId) });
      if (!deletedMcq) {
        throw new Error('MCQ not found');
      }
      return deletedMcq;
    } catch (err) {
      throw err;
    }
  }

  async startMcq(chapterId: string[], questionCount: number, schoolId: string | Types.ObjectId) {
    try {
      const mcqs = await this.mcqModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        { $match: { chapterId: { $in: chapterId.map(id => new Types.ObjectId(id)) } } },
        { $sample: { size:parseInt(questionCount+"") } },
        {$project:{
          correctAnswer:0,
        }}
      ]);
      return mcqs;
    } catch (err) {
      throw err;
    }}

  async getMcqAnswers(mcqId: string[],schoolId: string | Types.ObjectId) {
    try {
      const mcqs = await this.mcqModel.aggregate([
        {
          $match: {
            _id: { $in: mcqId.map(id => new Types.ObjectId(id)) },
            schoolId: new Types.ObjectId(schoolId)
          }
        },
        {
          $project: {
            correctAnswer: 1
          }
        }
      ]);
      return mcqs;
    } catch (err) {
      throw err;
    }
  }
}
