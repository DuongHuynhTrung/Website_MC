import { OAuth2Client } from 'google-auth-library';
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private jwtService: JwtService,
  ) {}

  async loginGoogleUser(token: string): Promise<{ accessToken: string }> {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const client = new OAuth2Client(clientId, clientSecret);
      const tokenInfo = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const googlePayload = tokenInfo.getPayload();
      const user = await this.userRepository.findOneBy({
        email: googlePayload.email,
      });
      if (user) {
        const payload: PayloadJwtDto = {
          fullname: user.fullname,
          email: user.email,
          status: user.status,
          role_name: user.role.role_name,
          isNewUser: false,
        };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken };
      } else {
        const role = await this.roleRepository.findOneByOrFail({ id: 2 });
        const user = this.userRepository.create({
          email: googlePayload.email,
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
    const role = await this.roleRepository.findOneByOrFail({ id: 2 });
    user.role = role;
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
    if (!user.status) {
      throw new BadRequestException(`Người dùng đang bị khóa tài khoản!`);
    }
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
}
