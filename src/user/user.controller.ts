import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from './enum/role.enum';

@UseGuards(JwtGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get Users with Pagination' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: [User],
  })
  @ApiNotFoundResponse({
    description: 'Have no User in the repository.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Roles(RoleEnum.ADMIN)
  @UseGuards(RolesGuard)
  @Get()
  getAllUsers(@Query('page') page: number): Promise<User[]> {
    return this.userService.getUsers(page);
  }

  @ApiOperation({ summary: 'Get a user by email' })
  @ApiOkResponse({
    description: 'The user has been successfully retrieved.',
    type: [User],
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Get(':email')
  getUserByEmail(@Param('email') email: string): Promise<User> {
    return this.userService.getUserByEmail(email);
  }

  @ApiOperation({ summary: 'Change User Name' })
  @ApiOkResponse({
    description: 'UserName has been changed',
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
  })
  @ApiBadRequestResponse({
    description: 'User status is false.',
  })
  @ApiBadRequestResponse({
    description: 'UserName is not following regex pattern.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Patch(':email/username/:username')
  updateUserName(
    @Param('email') email: string,
    @Param('username') username: string,
  ): Promise<string> {
    return this.userService.changeUserName(email, username);
  }
}
