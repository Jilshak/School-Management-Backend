import { PartialType } from "@nestjs/mapped-types";
import { CreateMCQDto } from "./create-mcq.dto";

export class UpdateMCQDto extends PartialType(CreateMCQDto) {
}