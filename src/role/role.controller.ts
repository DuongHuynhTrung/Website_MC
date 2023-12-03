import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RoleService } from './role.service';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RoleEnum } from 'src/role/enum/role.enum';
import { Role } from './entities/role.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';

@ApiTags('Role')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: 'Get Role By Role Name',
  })
  @ApiOkResponse({
    description: 'Role has been successfully retrieved',
    type: Role,
  })
  @ApiNotFoundResponse({
    description: 'Role ${role_name} not found',
  })
  @Get()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  getRoleByRoleName(@Param('roleName') roleName: RoleEnum): Promise<Role> {
    return this.roleService.getRoleByRoleName(roleName);
  }
}
