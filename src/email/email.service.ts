import { JwtService } from '@nestjs/jwt';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { User } from 'src/user/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterOtpDto } from './dto/register-otp.dto';
import * as moment from 'moment';
import { PayloadJwtDto } from 'src/auth/dto/payload-jwt.dto';
import { ForgotPasswordOtpDto } from './dto/forgot-password-otp.dto';
import { MyFunctions } from 'src/utils/MyFunctions';
import { Support } from 'src/support/entities/support.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,

    private jwtService: JwtService,

    private configService: ConfigService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendOtpWhenRegister(registerOtpDto: RegisterOtpDto) {
    let userEmailAvailable = null;
    try {
      userEmailAvailable = await this.userRepository.findOneBy({
        email: registerOtpDto.email,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!userEmailAvailable) {
      throw new NotFoundException(
        `Người dùng với email ${registerOtpDto.email} không tồn tại!`,
      );
    }
    if (userEmailAvailable.status) {
      throw new BadRequestException(`Tài khoản đã được kích hoạt!`);
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpired = new Date();
    try {
      await this.mailerService.sendMail({
        to: registerOtpDto.email,
        subject: 'Xác thực OTP',
        html: `<body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
        <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%"
            style="max-width:37.5em;background-color:#ffffff;border:1px solid #eee;border-radius:5px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;width:360px;margin:0 auto;padding:68px 0 68px">
            <div>
                <tr style="width:100%">
                    <td>
                        <img alt="Khoduan" src="https://live.staticflickr.com/65535/53614111501_d7d80942ac_w.jpg"
                            width="200" height="auto"
                            style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
                        <p
                            style="font-size:11px;line-height:16px;margin:16px 8px 8px 8px;color:#0a85ea;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;text-transform:uppercase;text-align:center">
                            Xác thực Email</p>
                        <h1
                            style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center">
                            Đây là mã OTP để hoàn thành việc xác thực email của bạn
                        </h1>
                        <table
                            style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px"
                            align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <p
                                            style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">
                                            ${otp}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <p
                            style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                            Liên hệ <a target="_blank" style="color:#444;text-decoration:underline"
                                href="mailto:anhhvq@fe.edu.vn">anhhvq@fe.edu.vn</a> hoặc thông qua số điện thoại
                            <span style="text-decoration: #0a85ea;">0367082493</span> nếu bạn không yêu cầu
                            chuyện này!
                        </p>
                    </td>
                </tr>
            </div>
        </table>
    </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { otpStored: otp, otpExpired };
  }

  async forgotPassword(forgotPasswordOtpDto: ForgotPasswordOtpDto) {
    let userEmailAvailable = null;
    try {
      userEmailAvailable = await this.userRepository.findOneBy({
        email: forgotPasswordOtpDto.email,
      });
    } catch (err) {
      throw new InternalServerErrorException(err.message);
    }
    if (!userEmailAvailable) {
      throw new NotFoundException(
        `Người dùng với email ${forgotPasswordOtpDto.email} không tồn tại`,
      );
    }
    if (!userEmailAvailable.status) {
      throw new BadRequestException(
        `Tài khoản đã bị khóa hoặc chưa kích hoạt!`,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpired = new Date();
    try {
      await this.mailerService.sendMail({
        to: forgotPasswordOtpDto.email,
        subject: 'Xác thực OTP',
        html: `<body style="background-color:#ffffff;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
        <table align="center" role="presentation" cellSpacing="0" cellPadding="0" border="0" width="100%"
            style="max-width:37.5em;background-color:#ffffff;border:1px solid #eee;border-radius:5px;box-shadow:0 5px 10px rgba(20,50,70,.2);margin-top:20px;width:360px;margin:0 auto;padding:68px 0 68px">
            <div>
                <tr style="width:100%">
                    <td>
                        <img alt="Khoduan" src="https://live.staticflickr.com/65535/53614111501_d7d80942ac_w.jpg"
                            width="200" height="auto"
                            style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" />
                        <p
                            style="font-size:11px;line-height:16px;margin:16px 8px 8px 8px;color:#0a85ea;font-weight:700;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;height:16px;letter-spacing:0;text-transform:uppercase;text-align:center">
                            Xác thực Email</p>
                        <h1
                            style="color:#000;display:inline-block;font-family:HelveticaNeue-Medium,Helvetica,Arial,sans-serif;font-size:20px;font-weight:500;line-height:24px;margin-bottom:0;margin-top:0;text-align:center">
                            Đây là mã OTP để hoàn thành việc xác thực email của bạn
                        </h1>
                        <table
                            style="background:rgba(0,0,0,.05);border-radius:4px;margin:16px auto 14px;vertical-align:middle;width:280px"
                            align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation" width="100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <p
                                            style="font-size:32px;line-height:40px;margin:0 auto;color:#000;display:inline-block;font-family:HelveticaNeue-Bold;font-weight:700;letter-spacing:6px;padding-bottom:8px;padding-top:8px;width:100%;text-align:center">
                                            ${otp}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
    
                        <p
                            style="font-size:15px;line-height:23px;margin:0;color:#444;font-family:HelveticaNeue,Helvetica,Arial,sans-serif;letter-spacing:0;padding:0 40px;text-align:center">
                            Liên hệ <a target="_blank" style="color:#444;text-decoration:underline"
                                href="mailto:anhhvq@fe.edu.vn">anhhvq@fe.edu.vn</a> hoặc thông qua số điện thoại
                            <span style="text-decoration: #0a85ea;">0367082493</span> nếu bạn không yêu cầu
                            chuyện này!
                        </p>
                    </td>
                </tr>
            </div>
        </table>
        </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return { otpStored: otp, otpExpired };
  }

  async verifyOtp(
    verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string }> {
    const { otp, otpExpired, otpStored, email } = verifyOtpDto;
    if (otpStored !== otp) {
      throw new BadRequestException('Sai OTP! Vui lòng thử lại!');
    }
    const currentTime = moment(new Date());
    const otpExpires = moment(otpExpired);
    const isExpired = currentTime.diff(otpExpires, 'minutes');
    if (isExpired > 10) {
      throw new BadRequestException('OTP đã hết hạn! Vui lòng thử lại!');
    }
    let user: User = null;
    try {
      user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new BadRequestException(
        'Người dùng không tìm thấy! Vui lòng thử lại!',
      );
    }
    user.status = true;
    let updateUserStatus: User = null;
    try {
      updateUserStatus = await this.userRepository.save(user);
      if (!updateUserStatus) {
        throw new InternalServerErrorException(
          'Something went wrong updating the status of the user',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    const payload: PayloadJwtDto = {
      fullname: updateUserStatus.fullname,
      email: updateUserStatus.email,
      status: updateUserStatus.status,
      role_name: user.role_name,
      avatar_url: user.avatar_url,
      isNewUser: false,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }

  async provideAccount(email: string, fullname: string, password: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Thông tin Tài khoản và Mật khẩu đăng nhập',
        html: `<body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe
        UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
        <div style="width:50vw; margin: 0 auto">
    
            <div style="width: 100%; height: 200px; margin: 0 auto;">
                <img src="https://live.staticflickr.com/65535/53614111501_d7d80942ac_w.jpg"
                    style="width: auto;height:200px;object-fit: cover; margin-left: 35%;">
            </div>
    
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;margin-bottom: 25px;">
                                Xin chào
                                <a style="font-size:16px;line-height:22px;margin:16px 0;font-weight: bold;">${fullname},</a>
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Để bảo vệ thông tin cũng như quyền lợi của bạn, vui lòng không chia sẽ thông tin này đến với
                                bất kì ai.
                            </p>
    
                            <p style="font-size:14px;line-height:22px;margin:16px 0;margin-bottom:10px;color:#3c4043">
                                Tài khoản đăng nhập vào hệ thống của bạn là:
                            <div style="margin-left: 25px;">
                                <p style="font-size:14px;line-height:22px;margin:10px 0;color:#3c4043">EMAIL:
                                    <a style="text-decoration:none;font-size:14px;line-height:22px">
                                        ${email}
                                    </a>
                                </p>
                                <p style="font-size:14px;line-height:22px;margin:10px 0px 0px 0px;color:#3c4043">MẬT KHẨU:
                                    <a style="text-decoration:none;font-size:14px;line-height:22px">
                                        ${password}
                                    </a>
                                </p>
                            </div>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
    
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Hãy liên lạc với chúng tôi nếu bạn có thắc mắc nào thêm.
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Trân trọng,</p>
                            <p
                                style="font-weight:bold;font-size:16px;line-height:22px;margin:16px 0px 0px 0px;color:#3c4043">
                                Hoàng
                                Vũ Quốc
                                Anh</p>
                        </td>
                    </tr>
                </tbody>
            </table>
    
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
    
                            <footer style="background-color: rgb(73, 97, 121); padding: 16px">
                                <div style="color: white;">
                                    <h5 style="color: white; margin: 0;width: 12.5rem;  font-weight: 500;">
                                        LIÊN HỆ NHANH
                                    </h5>
                                    <div>
                                        <div style="padding: 10px 0px; border-color: white; border-top-width: 1px;">
                                            <div style="display:inline;">
                                                <img alt="logo" loading="lazy" width="100" height="100" decoding="async"
                                                    src="https://firebasestorage.googleapis.com/v0/b/website-for-mc.appspot.com/o/khoduan%2Flogo.png?alt=media&token=07e0dbe7-8844-4c2b-9f34-19ad64c87c19"
                                                    style="color: transparent; display:inline-block;">
                                                <p
                                                    style="height: 100px;margin-bottom: 0px;margin-top: 0px; font-size: 15px; vertical-align: middle;margin-left: 15px;font-weight: 500; display:inline-block;">
                                                    Kho Dự án
                                                    Truyền thông - Quảng bá
                                                    <br>Sản phẩm Văn hóa Bản địa Việt Nam
                                                </p>
                                            </div>
                                            <div style="">
                                                <p style="font-weight: 500; color: white; margin: 0;">Hoàng Vũ Quốc Anh
                                                    (Mr.) </p>
                                                <p style="font-size: 12px; font-style: italic; color: white; margin: 0;">
                                                    Quản lý dự án</p>
                                                <div style="height: 5px;"></div>
                                                <p style=" color: white; margin: 0;">Hotline: <span
                                                        style="font-weight: 500;">0367082493</span>
                                                </p>
                                                <p style=" color: white; margin: 0;">Email:
                                                    <span
                                                        style="text-decoration: none; color: white; font-weight: 500; color: white;">
                                                        <a href="mailto:anhhvq@fe.edu.vn" target="_blank"
                                                            style="text-decoration: none; color: white;">anhhvq@fe.edu.vn</a>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </footer>
    
    
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
              </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async resetPassword(verifyOtpDto: VerifyOtpDto) {
    const { otp, otpExpired, otpStored, email } = verifyOtpDto;
    if (otpStored !== otp) {
      throw new BadRequestException('Sai OTP! Vui lòng thử lại!');
    }
    const currentTime = moment(new Date());
    const otpExpires = moment(otpExpired);
    const isExpired = currentTime.diff(otpExpires, 'minutes');
    if (isExpired > 10) {
      throw new BadRequestException('OTP đã hết hạn! Vui lòng thử lại!');
    }
    let user: User = null;
    try {
      user = await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    if (!user) {
      throw new BadRequestException(
        'Người dùng không tìm thấy! Vui lòng thử lại!',
      );
    }
    const passwordGenerated = await MyFunctions.generatePassword(12);
    user.password = passwordGenerated.passwordEncoded;
    let updateUserStatus: User = null;
    try {
      updateUserStatus = await this.userRepository.save(user);
      if (!updateUserStatus) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi đặt lại mật khẩu cho người dùng',
        );
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Thông tin Đăng nhập Mới đã được khởi tạo',
        html: `<body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe
        UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
        <div style="width:50vw; margin: 0 auto">
            <div style="width: 100%; height: 200px; margin: 0 auto;">
                <img src="https://live.staticflickr.com/65535/53614111501_d7d80942ac_w.jpg"
                    style="width: auto;height:200px;object-fit: cover; margin-left: 35%;">
            </div>
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;margin-bottom: 25px;">
                                Xin chào
                                <a style="font-size:16px;line-height:22px;margin:16px 0;font-weight: bold;">${user.fullname},</a>
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu từ phía bạn. Vui lòng không chia sẻ thông tin
                                đăng nhập này với bất
                                kỳ ai. Chúng tôi không bao giờ yêu cầu thông tin đăng nhập qua email hoặc các phương tiện
                                khác ngoài trang web chính thức của chúng tôi. Dưới đây là
                                thông tin cần thiết để bạn có thể đăng nhập vào hệ thống:
                            </p>
    
                            <div style="margin-left: 25px;">
                                <p style="font-size:14px;line-height:22px;margin:10px 0;color:#3c4043">EMAIL:
                                    <a style="font-weight:bold;text-decoration:none;font-size:14px;line-height:22px">
                                        ${user.email}
                                    </a>
                                </p>
                                <p style="font-size:14px;line-height:22px;margin:10px 0px 0px 0px;color:#3c4043">MẬT KHẨU
                                    MỚI:
                                    <a style=" font-weight:bold;text-decoration:none;font-size:14px;line-height:22px">
                                        ${passwordGenerated.password}
                                    </a>
                                </p>
                            </div>
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Để đảm bảo tính bảo mật, chúng tôi khuyến nghị bạn đổi mật khẩu sau khi đăng nhập lần đầu
                                tiên. Nếu bạn không thực hiện yêu cầu này, vui lòng thông báo cho chúng tôi ngay lập tức.
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Nếu có bất kỳ câu hỏi hoặc vấn đề gì, đừng ngần ngại liên hệ với chúng tôi qua địa chỉ email
                                này.
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Chúng tôi rất cảm ơn sự hợp tác của bạn.
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Trân trọng,</p>
                            <p
                                style="font-weight:bold;font-size:16px;line-height:22px;margin:16px 0px 0px 0px;color:#3c4043">
                                Hoàng
                                Vũ Quốc
                                Anh</p>
                        </td>
                    </tr>
                </tbody>
            </table>
    
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
    
    
                            <footer style="background-color: rgb(73, 97, 121); padding: 16px">
                                <div style="color: white;">
                                    <h5 style="color: white; margin: 0;width: 12.5rem;  font-weight: 500;">
                                        LIÊN HỆ NHANH
                                    </h5>
                                    <div>
                                        <div style="padding: 10px 0px; border-color: white; border-top-width: 1px;">
                                            <div style="display:inline;">
                                                <img alt="logo" loading="lazy" width="100" height="100" decoding="async"
                                                    src="https://firebasestorage.googleapis.com/v0/b/website-for-mc.appspot.com/o/khoduan%2Flogo.png?alt=media&token=07e0dbe7-8844-4c2b-9f34-19ad64c87c19"
                                                    style="color: transparent; display:inline-block;">
                                                <p
                                                    style="height: 100px;margin-bottom: 0px;margin-top: 0px; font-size: 15px; vertical-align: middle;margin-left: 15px;font-weight: 500; display:inline-block;">
                                                    Kho Dự án
                                                    Truyền thông - Quảng bá
                                                    <br>Sản phẩm Văn hóa Bản địa Việt Nam
                                                </p>
                                            </div>
                                            <div style="">
                                                <p style="font-weight: 500; color: white; margin: 0;">Hoàng Vũ Quốc Anh
                                                    (Mr.) </p>
                                                <p style="font-size: 12px; font-style: italic; color: white; margin: 0;">
                                                    Quản lý dự án</p>
                                                <div style="height: 5px;"></div>
                                                <p style=" color: white; margin: 0;">Hotline: <span
                                                        style="font-weight: 500;">0367082493</span>
                                                </p>
                                                <p style=" color: white; margin: 0;">Email:
                                                    <span
                                                        style="text-decoration: none; color: white; font-weight: 500; color: white;">
                                                        <a href="mailto:anhhvq@fe.edu.vn" target="_blank"
                                                            style="text-decoration: none; color: white;">anhhvq@fe.edu.vn</a>
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </footer>
    
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
              </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
    return 'Password đã được đặt lại. Hãy kiểm tra email!';
  }

  async sendSupport(support: Support) {
    try {
      await this.mailerService.sendMail({
        to: this.configService.get('MAIL_USER'),
        subject: 'Yêu cầu hỗ trợ vấn đề',
        html: `<body style="background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,Segoe
        UI,Roboto,Oxygen-Sans,Ubuntu,Cantarell,Helvetica Neue,sans-serif">
        <div style="width:50vw; margin: 0 auto">
            <table style="padding:0 40px" align="center" border="0" cellPadding="0" cellSpacing="0" role="presentation"
                width="100%">
                <tbody>
                    <tr>
                        <td>
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;margin-bottom: 25px;">
                                Xin chào
                                <a style="font-size:16px;line-height:22px;margin:16px 0;font-weight: bold;">Hoàng Vũ Quốc
                                    Anh,</a>
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Tôi viết email này để yêu cầu sự trợ giúp về vấn đề liên quan đến
                                <span style="font-size:14px;font-weight: bold;">${
                                  support.support_type
                                }</span>, cụ
                                thể là:
                            </p>
    
                            <p style=" font-size:14px;line-height:22px;margin:16px 0;margin-bottom:10px;color:#3c4043">
                                ${support.support_content}
                            </p>
    
                            ${
                              support.support_image
                                ? `<div>
                            <p style=" font-size:14px;line-height:22px;margin:16px 0;margin-bottom:10px;color:#3c4043">
                                Hình ảnh liên quan: </p>

                            <img width="400px"
                                src="${support.support_image}"
                                alt="img" />
                            </div>`
                                : ``
                            }
    
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Do đó, tôi muốn nhờ bạn kiểm tra và cung cấp sự hỗ trợ để giải quyết vấn đề
                                này. Nếu bạn có thời gian, tôi rất mong nhận được phản hồi từ bạn trong thời gian sớm nhất.
    
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043;text-align: justify">
                                Xin chân thành cảm ơn sự hỗ trợ của bạn.
                            </p>
                            <p style="font-size:14px;line-height:22px;margin:16px 0;color:#3c4043">Trân trọng,</p>
                            <p
                                style="font-weight:bold;font-size:16px;line-height:22px;margin:16px 0px 0px 0px;color:#3c4043">
                                ${support.fullname}
                            </p>
                            <p
                                style="font-size:14px;line-height:22px;margin:0px;color:#3c4043;text-align: justify">
                                ${support.email}
                            </p>
    
                            <hr
                                style="width:100%;border:none;border-top:1px solid black;border-color:black;margin:20px 0" />
    
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>`,
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
