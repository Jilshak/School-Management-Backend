import { IsString, IsArray, IsNotEmpty, ValidateNested, IsBase64, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class ChapterDto {
    @ApiProperty({ description: 'Name of the chapter' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Description of the chapter' })
    @IsString()
    @IsOptional()
    chapterDescription?: string;

    @ApiProperty({ description: 'Base64 encoded PDF file for the chapter' })
    @IsBase64()
    pdf: string; // Base64 encoded PDF file

    @ApiProperty({ description: 'Description of the chapter' })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Hours of the chapter' })
    @IsNumber()
    @IsOptional()
    hours: number;
}

class SubjectDto {
    @ApiProperty({ description: 'ID of the subject' })
    @IsString()
    @IsNotEmpty()
    subject: string; // This will be the subject ID

    @ApiProperty({ description: 'Array of chapters for the subject', type: [ChapterDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ChapterDto)
    chapters: ChapterDto[];
}

export class CreateSyllabusDto {
    @ApiProperty({ description: 'Name of the syllabus' })
    @IsString()
    @IsNotEmpty()
    syllabusName: string;

    @ApiProperty({ description: 'Array of subjects in the syllabus', type: [SubjectDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SubjectDto)
    subjects: SubjectDto[];

    @ApiProperty({ description: 'Array of class IDs to which the syllabus is assigned' })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    assignedClasses: string[]; // Array of class IDs
}
