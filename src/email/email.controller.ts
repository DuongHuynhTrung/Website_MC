import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RegisterOtpDto } from './dto/register-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { EmailService } from './email.service';
import { Controller, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';

@ApiTags('EmailService')
@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @ApiOperation({ summary: 'Send otp when register' })
  @ApiOkResponse({
    description: 'OtpExpired and OtpStored',
  })
  @ApiBadRequestResponse({
    description: 'User with email is already available.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Post('sendOtpRegister')
  @HttpCode(HttpStatus.OK)
  sendOtpWhenRegister(@Body() registerOtpDto: RegisterOtpDto) {
    return this.emailService.sendOtpWhenRegister(registerOtpDto);
  }

  @ApiOperation({ summary: 'Verify Otp To register' })
  @ApiOkResponse({
    description: 'Verify Otp Successfully',
  })
  @ApiBadRequestResponse({
    description: 'Wrong OTP! Please try again.',
  })
  @ApiBadRequestResponse({
    description: 'OTP is expired! Please try again.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error.',
  })
  @Post('verifyOtp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
  ): Promise<{ accessToken: string }> {
    return this.emailService.verifyOtp(verifyOtpDto);
  }
}
