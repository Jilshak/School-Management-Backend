import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsMongoId, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateClassroomOfStudentsDto  {
    @ApiProperty({ type: [String] })
    @IsArray()
    @IsMongoId({ each: true })
    studentIds: string[];

    @ApiProperty({ type: String })
    @IsMongoId()
    classId: string;
}