import { PartialType } from '@nestjs/swagger';
import { CreateSchoolTypeDto } from './create-school-type.dto';

export class UpdateSchoolTypeDto extends PartialType(CreateSchoolTypeDto) {}