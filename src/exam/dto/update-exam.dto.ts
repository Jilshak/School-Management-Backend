import { PartialType } from '@nestjs/swagger';
import { CreateSemExamDto, CreateClassTest } from './create-exam.dto';

export class UpdateSemExamDto extends PartialType(CreateSemExamDto) {}
export class UpdateClassTestDto extends PartialType(CreateClassTest) {}