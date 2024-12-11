import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsString, IsEnum, IsBoolean } from "class-validator";
import { Types } from "mongoose";

export enum DifficultyLevel {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

export class CreateMCQDto {
    @ApiProperty({ description: 'Question of the MCQ' })
    @IsString()
    @IsNotEmpty()
    question: string;

    @ApiProperty({ description: 'Options of the MCQ', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    options: string[];

    @ApiProperty({ description: 'Correct answer of the MCQ', type: String })
    @IsNumber()
    @IsNotEmpty()
    correctAnswer: string;

    @ApiProperty({ description: 'Syllabus ID of the MCQ', type: String })
    @IsMongoId()
    @IsNotEmpty()
    syllabusId: string | Types.ObjectId;

    @ApiProperty({ description: 'Subject ID of the MCQ', type: String })
    @IsMongoId()
    @IsNotEmpty()
    subjectId: string| Types.ObjectId;

    @ApiProperty({ description: 'Chapter ID of the MCQ', type: String })
    @IsMongoId()
    @IsNotEmpty()
    chapterId: string | Types.ObjectId;

    @ApiProperty({ description: 'Tags of the MCQ', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    tags?: string[];
    
    @ApiProperty({ 
        description: 'Difficulty level of the MCQ', 
        enum: DifficultyLevel,
        example: DifficultyLevel.MEDIUM 
    })
    @IsEnum(DifficultyLevel)
    @IsNotEmpty()
    difficulty?: DifficultyLevel;

    @ApiProperty({ description: 'Flag to check if the MCQ is active', type: Boolean })
    @IsBoolean()
    @IsNotEmpty()
    isActive?: boolean;
}