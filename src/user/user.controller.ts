import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
  Body,
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
import { RolesGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';
import { RoleEnum } from '../role/enum/role.enum';
import { GetUser } from 'src/auth/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
  getAllUsers(
    @Query('page') page: number,
  ): Promise<[{ totalUsers: number }, User[]]> {
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

  @ApiOperation({ summary: 'Search user who have email contain searchEmail' })
  @ApiOkResponse({
    description: 'The list user has been successfully retrieved.',
    type: [User],
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Get('/search/:roleName/:searchEmail')
  searchUserByEmail(
    @GetUser() user: User,
    @Param('roleName') roleName: RoleEnum,
    @Param('searchEmail') searchEmail?: string,
  ): Promise<User[]> {
    return this.userService.searchUserByEmailString(
      searchEmail,
      roleName,
      user,
    );
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
  @Patch('update-profile')
  updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @GetUser() user: User,
  ): Promise<User> {
    return this.userService.updateProfile(updateProfileDto, user);
  }
}
