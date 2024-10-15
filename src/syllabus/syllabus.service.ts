import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSyllabusDto } from './dto/create-syllabus.dto';
import { UpdateSyllabusDto } from './dto/update-syllabus.dto';
import path from 'path';
import fs from 'fs';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Syllabus } from 'src/domains/schema/syllabus.schema';

@Injectable()
export class SyllabusService {
  constructor(
    @InjectModel(Syllabus.name) private syllabusModel: Model<Syllabus>,
  ) {}

  async create(createSyllabusDto: CreateSyllabusDto, schoolId: Types.ObjectId) {
    try {
      const syllabusId = new Types.ObjectId();
      const structuredData = {
        _id: syllabusId,
        syllabusName: createSyllabusDto.syllabusName,
        subjects: await Promise.all(
          createSyllabusDto.subjects.map(async (subject) => {
            const chapters = await Promise.all(
              subject.chapters.map(async (chapter) => {
                const chapterId = new Types.ObjectId();
                const filePath = await this.uploadChapterPdf(
                  chapter.pdf,
                  schoolId.toString(),
                  syllabusId.toString(),
                  subject.subject.toString(),
                  chapterId.toString(),
                );
                return { _id: chapterId, chapterName: chapter.name, filePath };
              }),
            );
            return { subjectId: new Types.ObjectId(subject.subject), chapters };
          }),
        ),
        assignedClasses: createSyllabusDto.assignedClasses.map(
          (classId) => new Types.ObjectId(classId),
        ),
      };
      const syllabus = new this.syllabusModel({ ...structuredData, schoolId });
      await syllabus.save();
      return syllabus;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(schoolId: Types.ObjectId) {
    const syllabuses = await this.syllabusModel
      .aggregate([
        { $match: { schoolId } },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjects.subjectId',
            foreignField: '_id',
            as: 'subjectDetails'
          }
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'assignedClasses',
            foreignField: '_id',
            as: 'classDetails'
          }
        },
        {
          $project: {
            _id: 1,
            syllabusName: 1,
            subjects: {
              $map: {
                input: '$subjects',
                as: 'subject',
                in: {
                  subjectId: '$$subject.subjectId',
                  chapters: '$$subject.chapters',
                  subjectName: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$subjectDetails',
                              as: 'sd',
                              cond: { $eq: ['$$sd._id', '$$subject.subjectId'] }
                            }
                          },
                          as: 'filteredSubject',
                          in: '$$filteredSubject.name'
                        }
                      },
                      0
                    ]
                  }
                }
              }
            },
            assignedClasses: {
              $map: {
                input: '$classDetails',
                as: 'class',
                in: {
                  _id: '$$class._id',
                  name: '$$class.name'
                }
              }
            },
            schoolId: 1,
            isActive: 1,
            createdBy: 1,
            updatedBy: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ])
      .exec();

    return {
      syllabuses,
    };
  }

  async findOne(id: string, schoolId: Types.ObjectId) {
    const syllabus = await this.syllabusModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id), schoolId } },
        {
          $lookup: {
            from: 'subjects',
            localField: 'subjects.subjectId',
            foreignField: '_id',
            as: 'subjectDetails'
          }
        },
        {
          $lookup: {
            from: 'classrooms',
            localField: 'assignedClasses',
            foreignField: '_id',
            as: 'classDetails'
          }
        },
        {
          $project: {
            _id: 1,
            syllabusName: 1,
            subjects: {
              $map: {
                input: '$subjects',
                as: 'subject',
                in: {
                  subjectId: '$$subject.subjectId',
                  chapters: '$$subject.chapters',
                  subjectName: {
                    $arrayElemAt: [
                      {
                        $map: {
                          input: {
                            $filter: {
                              input: '$subjectDetails',
                              as: 'sd',
                              cond: { $eq: ['$$sd._id', '$$subject.subjectId'] }
                            }
                          },
                          as: 'filteredSubject',
                          in: '$$filteredSubject.name'
                        }
                      },
                      0
                    ]
                  }
                }
              }
            },
            assignedClasses: {
              $map: {
                input: '$classDetails',
                as: 'class',
                in: {
                  _id: '$$class._id',
                  name: '$$class.name'
                }
              }
            },
            schoolId: 1,
            isActive: 1,
            createdBy: 1,
            updatedBy: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ])
      .exec();

    if (!syllabus || syllabus.length === 0) {
      throw new NotFoundException(`Syllabus with ID "${id}" not found`);
    }
    return syllabus[0];
  }

  async update(
    id: string,
    updateSyllabusDto: UpdateSyllabusDto,
    schoolId: Types.ObjectId,
  ) {
    const syllabus = await this.syllabusModel
      .findOne({ _id: id, schoolId })
      .exec();
    if (!syllabus) {
      throw new NotFoundException(`Syllabus with ID "${id}" not found`);
    }

    // Update basic fields
    if (updateSyllabusDto.syllabusName) {
      syllabus.syllabusName = updateSyllabusDto.syllabusName;
    }
    if (updateSyllabusDto.assignedClasses) {
      syllabus.assignedClasses = updateSyllabusDto.assignedClasses.map(
        (classId) => new Types.ObjectId(classId),
      );
    }

    // Update subjects and chapters
    if (updateSyllabusDto.subjects) {
      syllabus.subjects = await Promise.all(
        updateSyllabusDto.subjects.map(async (subject) => {
          const chapters = await Promise.all(
            subject.chapters.map(async (chapter) => {
              let filePath = chapter.filePath;
              if (chapter.pdf) {
                const chapterId = new Types.ObjectId();
                filePath = await this.uploadChapterPdf(
                  chapter.pdf,
                  schoolId.toString(),
                  syllabus._id.toString(),
                  subject.subject.toString(),
                  chapterId.toString(),
                );
              }
              return {
                _id: new Types.ObjectId(),
                chapterName: chapter.name,
                filePath,
              };
            }),
          );
          return { subjectId: new Types.ObjectId(subject.subject), chapters };
        }),
      );
    }

    await syllabus.save();
    return syllabus;
  }

  async remove(id: string, schoolId: Types.ObjectId) {
    const syllabus = await this.syllabusModel
      .findOneAndDelete({ _id: id, schoolId })
      .exec();
    if (!syllabus) {
      throw new NotFoundException(`Syllabus with ID "${id}" not found`);
    }
    // TODO: Implement logic to delete associated PDF files
    return { message: 'Syllabus deleted successfully' };
  }

  private async uploadChapterPdf(
    base64String: string,
    schoolId: string,
    syllabusId: string,
    subjectId: string,
    chapterId: string,
  ) {
    try {
      const file = Buffer.from(base64String, 'base64');
      const uploadsDir = path.join(
        process.cwd(),
        'uploads',
        'syllabus',
        schoolId,
        syllabusId,
        subjectId,
      );
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(uploadsDir, chapterId + '.pdf');
      await fs.promises.writeFile(filePath, file);
      return (
        '/syllabus/' +
        schoolId +
        '/' +
        syllabusId +
        '/' +
        subjectId +
        '/' +
        chapterId +
        '.pdf'
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
