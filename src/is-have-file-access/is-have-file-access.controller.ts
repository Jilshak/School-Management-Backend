import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { IsHaveFileAccessService } from './is-have-file-access.service';
import { UserRole } from 'src/domains/enums/user-roles.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { LoginUser } from 'src/shared/decorators/loginUser.decorator';
import { Types } from 'mongoose';

@ApiTags('is-have-file-access')
@ApiBearerAuth()
@Controller('is-have-file-access')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class IsHaveFileAccessController {
    constructor(private readonly isHaveFileAccessService: IsHaveFileAccessService) {}

    @Post("write")
    @Roles(UserRole.ADMISSION_TEAM,UserRole.HR,UserRole.TEACHER,UserRole.SUPERADMIN,UserRole.ADMIN)
    @ApiOperation({ summary: 'Check if the user has write access to the file' })
    @ApiResponse({ status: 200, description: 'User has write access to the file' })
    @ApiResponse({ status: 403, description: 'User does not have write access to the file' })
    checkWriteAccess(@LoginUser("userId") userId: Types.ObjectId, @LoginUser("schoolId") schoolId: Types.ObjectId, @Body() body: { fileLocation: string },@LoginUser() details:any) {
        return this.isHaveFileAccessService.checkWriteAccess(userId, schoolId, body.fileLocation,details);
    }

    @Post("read")
    @Roles()
    @ApiOperation({ summary: 'Check if the user has read access to the file' })
    @ApiResponse({ status: 200, description: 'User has read access to the file' })
    @ApiResponse({ status: 403, description: 'User does not have read access to the file' })
    checkReadAccess(@LoginUser("userId") userId: Types.ObjectId, @LoginUser("schoolId") schoolId: Types.ObjectId, @Body() body: { file: string },@LoginUser() details:any) {
        return this.isHaveFileAccessService.checkReadAccess(userId, schoolId, body.file,details);
    }
}
