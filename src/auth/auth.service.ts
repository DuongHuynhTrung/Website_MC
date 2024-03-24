import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import * as bcrypt from 'bcrypt';
import { PayloadJwtDto } from './dto/payload-jwt.dto';
import { JwtService } from '@nestjs/jwt';
import { SignInGoogleDto } from './dto/sign-in-google.dto';
import { Role } from 'src/role/entities/role.entity';
import { Repository } from 'typeorm';
import { jwtDecode } from 'jwt-decode';
import { RoleEnum } from 'src/role/enum/role.enum';
import { ProvideAccountDto } from './dto/provide-account.dto';
import { UpRoleAccountDto } from './dto/upRole-account.dto';
import { UserService } from 'src/user/user.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly jwtService: JwtService,

    private readonly userService: UserService,
  ) {}

  async loginGoogleUser(token: string): Promise<{ accessToken: string }> {
    const googlePayload: any = jwtDecode(token);
    try {
      const user = await this.userRepository.findOne({
        where: {
          email: googlePayload.email,
        },
        relations: ['role'],
      });
      if (user) {
        const payload: PayloadJwtDto = {
          fullname: user.fullname,
          email: user.email,
          status: user.status,
          role_name: user.role.role_name,
          avatar_url: user.avatar_url,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      } else {
        const role = await this.roleRepository.findOneByOrFail({
          role_name: 'Student',
        });
        const user = this.userRepository.create({
          email: googlePayload.email,
          fullname: googlePayload.name,
          avatar_url: googlePayload.picture,
          status: true,
          role: role,
        });
        if (!user) {
          throw new BadRequestException(
            'Có lỗi xảy ra khi tạo người dùng mới. Vui lòng kiểm tra lại thông tin',
          );
        }

        await this.userRepository.save(user);

        const payload: PayloadJwtDto = {
          fullname: user.fullname,
          email: user.email,
          status: user.status,
          role_name: user.role.role_name,
          avatar_url: user.avatar_url,
          isNewUser: true,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async signUp(signUpDto: SignUpDto): Promise<string> {
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;
    if (!PASSWORD_REGEX.test(signUpDto.password)) {
      throw new BadRequestException('Mật khẩu phải tuân thủ theo nguyên tắc');
    }
    try {
      const isExist = await this.userRepository.findOneBy({
        email: signUpDto.email,
      });
      if (isExist) {
        throw new BadRequestException(
          `Người dùng với email ${signUpDto.email} đã tồn tại trong hệ thống`,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const user = this.userRepository.create(signUpDto);
    if (!user) {
      throw new BadRequestException(
        'Có lỗi xảy ra khi tạo người dùng mới. Vui lòng kiểm tra lại thông tin',
      );
    }
    user.status = false;
    // const role = await this.roleRepository.findOneByOrFail({ id: 2 });
    // user.role = role;
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(signUpDto.password, salt);

      await this.userRepository.save(user);
      return 'Đăng ký thành công!';
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email đã được sử dụng!');
      } else {
        throw new InternalServerErrorException(error.message);
      }
    }
  }

  async checkEmailExist(email: string): Promise<User> {
    try {
      const user: User = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        return null;
      }
      return user;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    let user: User = null;
    try {
      user = await this.userRepository.findOne({
        where: { email: signInDto.email },
        relations: ['role'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new NotFoundException(
        `Người dùng với email ${signInDto.email} không tồn tại!`,
      );
    }
    // if (!user.status) {
    //   throw new BadRequestException(
    //     `Tài khoản của người dùng đang ở trạng thái không hoạt động!`,
    //   );
    // }
    try {
      const checkPassword = await bcrypt.compare(
        signInDto.password,
        user.password,
      );
      if (!checkPassword) {
        throw new Error('Sai mật khẩu!');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const payload: PayloadJwtDto = {
      fullname: user.fullname,
      email: user.email,
      status: user.status,
      role_name: user.role.role_name,
      avatar_url: user.avatar_url,
      isNewUser: false,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async signInGoogle(
    signInGoogleDto: SignInGoogleDto,
  ): Promise<{ accessToken: string }> {
    try {
      const isExist = await this.userRepository.findOneBy({
        email: signInGoogleDto.email,
      });
      if (isExist) {
        const payload: PayloadJwtDto = {
          fullname: isExist.fullname,
          email: isExist.email,
          status: isExist.status,
          role_name: isExist.role.role_name,
          avatar_url: isExist.avatar_url,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
      } else {
        const user = this.userRepository.create(signInGoogleDto);
        if (!user) {
          throw new InternalServerErrorException(
            'Something went wrong when creating user',
          );
        }
        user.status = true;
        await this.userRepository.save(user);

        const payload: PayloadJwtDto = {
          fullname: isExist.fullname,
          email: isExist.email,
          status: isExist.status,
          role_name: isExist.role.role_name,
          avatar_url: isExist.avatar_url,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async handleVerifyToken(token) {
    try {
      const payload = this.jwtService.verify(token);
      return payload['email'];
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }

  async provideAccountByAdmin(
    provideAccountDto: ProvideAccountDto,
    admin: User,
  ): Promise<User> {
    if (admin.role.role_name != RoleEnum.ADMIN) {
      throw new BadRequestException(
        'Chỉ có Administration mới có quyền cấp tài khoản',
      );
    }
    if (provideAccountDto.roleName == RoleEnum.ADMIN) {
      throw new BadRequestException(
        'Không thể cung cấp tài khoản Administrator cho người dùng',
      );
    }
    try {
      const isExist = await this.userRepository.findOneBy({
        email: provideAccountDto.email,
      });
      if (isExist) {
        throw new BadRequestException(
          `Email ${provideAccountDto.email} đã tồn tại trong hệ thống`,
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const user = this.userRepository.create(provideAccountDto);
    if (!user) {
      throw new BadRequestException(
        'Có lỗi xảy ra khi tạo người dùng mới. Vui lòng kiểm tra lại thông tin',
      );
    }
    user.status = true;
    const role = await this.roleRepository.findOneByOrFail({
      role_name: provideAccountDto.roleName,
    });
    user.role = role;
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(provideAccountDto.password, salt);

      const result: User = await this.userRepository.save(user);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi cấp tài khoản cho người dùng',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async upRoleByAdmin(
    upRoleAccountDto: UpRoleAccountDto,
    admin: User,
  ): Promise<User> {
    if (admin.role.role_name != RoleEnum.ADMIN) {
      throw new BadRequestException(
        'Chỉ có Administration mới có quyền nâng cấp vai trò của người dùng',
      );
    }
    if (upRoleAccountDto.roleName == RoleEnum.ADMIN) {
      throw new BadRequestException(
        'Không thể nâng cấp vai trò của người dùng thành Administration',
      );
    }
    if (upRoleAccountDto.roleName == RoleEnum.STUDENT) {
      throw new BadRequestException(
        'Không thể nâng cấp vai trò của người dùng thành sinh viên',
      );
    }
    const user: User = await this.userService.getUserByEmail(
      upRoleAccountDto.email,
    );
    if (!user.status) {
      throw new BadRequestException(
        'Tài khoản của người dùng đang ở trạng thái không hoạt động',
      );
    }
    const role: Role = await this.roleRepository.findOneByOrFail({
      role_name: upRoleAccountDto.roleName,
    });
    user.role = role;
    try {
      const result: User = await this.userRepository.save(user);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi nâng cấp vai trò cho người dùng',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<string> {
    if (!user.status) {
      throw new BadRequestException(
        `Tài khoản của người dùng đang ở trạng thái không hoạt động`,
      );
    }
    try {
      const checkPassword = await bcrypt.compare(
        changePasswordDto.oldPassword,
        user.password,
      );
      if (!checkPassword) {
        throw new BadRequestException('Nhập sai mật khẩu cũ!');
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;
    if (!PASSWORD_REGEX.test(changePasswordDto.newPassword)) {
      throw new BadRequestException('Mật khẩu phải tuân thủ theo nguyên tắc');
    }
    try {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(changePasswordDto.newPassword, salt);

      await this.userRepository.save(user);
      return 'Đổi mật khẩu thành công!';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
