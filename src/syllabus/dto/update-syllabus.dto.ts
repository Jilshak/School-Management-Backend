import { PartialType } from "@nestjs/swagger";
import { CreateSyllabusDto } from "./create-syllabus.dto";
import { IsOptional, IsString, IsArray, ValidateNested, IsBase64, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

class UpdateChapterDto {
    @ApiProperty({ description: 'Name of the chapter' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ description: 'Base64 encoded PDF file for the chapter' })
    @IsBase64()
    @IsOptional()
    pdf?: string;

    @ApiProperty({ description: 'File path of the existing PDF' })
    @IsString()
    @IsOptional()
    filePath?: string;

    @ApiProperty({ description: 'id of Mongodb' })
    @IsMongoId()
    @IsOptional()
    _id?: string;
}

class UpdateSubjectDto {
    @ApiProperty({ description: 'ID of the subject' })
    @IsMongoId()
    @IsOptional()
    subject?: Types.ObjectId | string;

    @ApiProperty({ description: 'Array of chapters for the subject', type: [UpdateChapterDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateChapterDto)
    @IsOptional()
    chapters?: UpdateChapterDto[];
}

export class UpdateSyllabusDto  {
    @ApiProperty({ description: 'Name of the syllabus' })
    @IsString()
    @IsOptional()
    syllabusName?: string;

    @ApiProperty({ description: 'Array of subjects in the syllabus', type: [UpdateSubjectDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateSubjectDto)
    @IsOptional()
    subjects?: UpdateSubjectDto[];

    @ApiProperty({ description: 'Array of class IDs to which the syllabus is assigned' })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    assignedClasses?: string[];
}
