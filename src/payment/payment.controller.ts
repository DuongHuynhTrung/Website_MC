import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Roles } from 'src/auth/role.decorator';
import { RolesGuard } from 'src/auth/role.guard';
import { RoleEnum } from 'src/role/enum/role.enum';
import { JwtGuard } from 'src/auth/jwt.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiOperation({ summary: 'Create MoMo Payment URL' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @UseGuards(JwtGuard)
  @Post('/moMo/:phaseId')
  createMoMoPaymentUrl(
    @Param('phaseId') phaseId: number,
    @GetUser() user: User,
  ): Promise<string> {
    return this.paymentService.createMoMoPaymentUrl(phaseId, user);
  }

  @ApiOperation({ summary: 'MoMo Payment Callback' })
  @Get('/moMo/paymentCallback')
  async paymentMoMoCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.paymentService.paymentMoMoCallback(request.query);
    response.redirect(result.redirectUrl);
  }

  @ApiOperation({ summary: 'Create VnPay Payment URL' })
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.BUSINESS, RoleEnum.RESPONSIBLE_PERSON)
  @UseGuards(JwtGuard)
  @Post('/vnPay/:phaseId')
  createVNPayPaymentUrl(
    @Param('phaseId') phaseId: number,
    @Req() request: Request,
    @GetUser() user: User,
  ): Promise<string> {
    return this.paymentService.createVNPayPaymentUrl(phaseId, user, request);
  }

  @ApiOperation({ summary: 'VnPay Payment Callback' })
  @Get('/vnPay/paymentCallback')
  async paymentVnPayCallback(
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.paymentService.paymentVnPayCallback(
      request.query,
    );
    response.redirect(result.redirectUrl);
  }
}
