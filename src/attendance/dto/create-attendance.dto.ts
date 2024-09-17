import { IsDate, IsMongoId, IsArray, ValidateNested, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  HALF_DAY = 'halfday'
}

class StudentAttendance {
  @IsString()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class CreateAttendanceDto {
  @IsDate()
  @Type(() => Date)
  attendanceDate: Date;

  @IsMongoId()
  classId: string;

  @IsMongoId()
  teacherId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendance)
  studentsAttendance: StudentAttendance[];
}
