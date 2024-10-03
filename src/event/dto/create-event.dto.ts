import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsString } from "class-validator";


export class CreateEventDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    startDate: Date;

    @ApiProperty()
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    endDate: Date;
    
    
}
