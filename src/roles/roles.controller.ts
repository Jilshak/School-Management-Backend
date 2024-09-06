import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '../domains/schema/roles.schema';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'The role has been successfully created.', type: Role })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateRoleDto })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Return all roles.', type: [Role] })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiResponse({ status: 200, description: 'Return the role.', type: Role })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, description: 'The role has been successfully updated.', type: Role })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  @ApiBody({ type: UpdateRoleDto })
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a role' })
  @ApiResponse({ status: 200, description: 'The role has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiParam({ name: 'id', required: true, description: 'Role ID' })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  // Role Permissions
  @Post('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({ status: 201, description: 'The permission has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreatePermissionDto })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rolesService.createPermission(createPermissionDto);
  }

  @Get('permissions/:roleId')
  @Roles('admin')
  @ApiOperation({ summary: 'Get permissions for a role' })
  @ApiResponse({ status: 200, description: 'Return the permissions for the role.' })
  @ApiResponse({ status: 404, description: 'Role not found.' })
  @ApiParam({ name: 'roleId', required: true, description: 'Role ID' })
  getPermissions(@Param('roleId') roleId: string) {
    return this.rolesService.getPermissions(roleId);
  }

  // Assign Role
  @Post('assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiResponse({ status: 200, description: 'The role has been successfully assigned.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Role or User not found.' })
  @ApiBody({ type: AssignRoleDto })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRole(assignRoleDto);
  }
}