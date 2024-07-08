import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import * as querystring from 'qs';
import { Request } from 'express';
import * as moment from 'moment';
import { Category } from 'src/category/entities/category.entity';
import { CategoryStatusEnum } from 'src/category/enum/category-status.enum';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { NotificationTypeEnum } from 'src/notification/enum/notification-type.enum';
import { NotificationService } from 'src/notification/notification.service';
import { Phase } from 'src/phase/entities/phase.entity';
import { CostStatusEnum } from 'src/phase/enum/cost-status.enum';
import { PhaseStatusEnum } from 'src/phase/enum/phase-status.enum';
import { RegisterPitching } from 'src/register-pitching/entities/register-pitching.entity';
import { RegisterPitchingStatusEnum } from 'src/register-pitching/enum/register-pitching.enum';
import { UserGroup } from 'src/user-group/entities/user-group.entity';
import { UserGroupService } from 'src/user-group/user-group.service';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { UserProjectService } from 'src/user-project/user-project.service';
import { UserProject } from 'src/user-project/entities/user-project.entity';
import { UserProjectStatusEnum } from 'src/user-project/enum/user-project-status.enum';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Phase)
    private readonly phaseRepository: Repository<Phase>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly configService: ConfigService,

    private readonly notificationService: NotificationService,

    private readonly userGroupService: UserGroupService,

    private readonly userProjectService: UserProjectService,
  ) {}

  async createMoMoPaymentUrl(phaseId: number, user: User): Promise<string> {
    //Logic with phase
    const phase: Phase = await this.phaseRepository
      .createQueryBuilder('phase')
      .leftJoinAndSelect('phase.project', 'project')
      .where('phase.id = :phaseId', { phaseId })
      .getOne();
    if (!phase) {
      throw new NotFoundException('Không tìm thấy giao đoạn');
    }
    if (phase.phase_status != PhaseStatusEnum.DONE) {
      throw new BadGatewayException(
        'Không thể thanh toán khi giai đoạn chưa hoàn thành',
      );
    }

    if (phase.cost_status != CostStatusEnum.NOT_TRANSFERRED) {
      throw new BadGatewayException('Giai đoạn đã được thanh toán');
    }

    const checkUserInProject: UserProject =
      await this.userProjectService.checkUserInProject(
        user.id,
        phase.project.id,
      );
    if (!checkUserInProject) {
      throw new NotFoundException('Người dùng không thuộc dự án');
    }
    if (
      checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT &&
      checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER
    ) {
      throw new ForbiddenException(
        'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể xác nhận đã chuyển tiền',
      );
    }

    // create momo url
    const partnerCode: string = this.configService.get('PartnerCode');
    const accessKey: string = this.configService.get('AccessKey');
    const secretKey: string = this.configService.get('SecretKey');
    const MoMoApiUrl: string = this.configService.get('MoMoApiUrl');
    const ipnUrl = this.configService.get('ReturnMoMoPaymentUrl');
    const redirectUrl = this.configService.get('ReturnMoMoPaymentUrl');
    const orderId = `${phaseId}-${new Date().getTime().toString()}`;
    const requestId = orderId;
    const orderInfo = `Thanh toán giai đoạn ${phase.phase_number} của dự án ${phase.project.name_project}`;
    const requestType = 'captureWallet';
    const extraData = '';
    const orderGroupId = '';
    const autoCapture = true;
    const amount = phase.expected_cost_total;
    const lang = 'vi';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      lang: lang,
      requestType: requestType,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    });
    const options = {
      method: 'POST',
      url: MoMoApiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
      data: requestBody,
    };

    try {
      const response = await axios(options);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else {
        console.error('Error:', error.message);
      }
      throw new Error('Không thể tạo yêu cầu thanh toán MoMo');
    }
  }

  async paymentMoMoCallback(data: any): Promise<any> {
    const phaseId: number = data.orderId.split('-')[0];
    const phase: Phase = await this.phaseRepository
      .createQueryBuilder('phase')
      .leftJoinAndSelect('phase.project', 'project')
      .leftJoinAndSelect('phase.categories', 'categories')
      .leftJoinAndSelect('project.register_pitchings', 'register_pitching')
      .leftJoinAndSelect('register_pitching.group', 'group')
      .where('phase.id = :phaseId', { phaseId })
      .getOne();

    phase.cost_status = CostStatusEnum.TRANSFERRED;
    await this.phaseRepository.save(phase);

    const categories: Category[] = phase.categories;
    categories.forEach(
      (category) => (category.category_status = CategoryStatusEnum.DONE),
    );
    await this.categoryRepository.save(categories);

    const registerPitching: RegisterPitching =
      phase.project.register_pitchings.find(
        (registerPitching) =>
          registerPitching.register_pitching_status ==
          RegisterPitchingStatusEnum.SELECTED,
      );

    const leaderOfGroup: UserGroup =
      await this.userGroupService.getLeaderOfGroup(registerPitching.group.id);

    const notificationDto: CreateNotificationDto = new CreateNotificationDto(
      NotificationTypeEnum.BUSINESS_TRANSFERRED_MONEY,
      `Doanh nghiệp đã thanh toán giai đoạn ${phase.phase_number} của dự án ${phase.project.name_project}`,
      this.configService.get('MAIL_USER'),
      leaderOfGroup.user.email,
    );
    await this.notificationService.createNotification(notificationDto);

    return {
      redirectUrl: `http://local-culture-projects.onrender.com/project/${phase.project.id}/view`,
    };
  }

  async createVNPayPaymentUrl(
    phaseId: number,
    user: User,
    req: Request,
  ): Promise<string> {
    //Logic with phase
    const phase: Phase = await this.phaseRepository
      .createQueryBuilder('phase')
      .leftJoinAndSelect('phase.project', 'project')
      .where('phase.id = :phaseId', { phaseId })
      .getOne();
    if (!phase) {
      throw new NotFoundException('Không tìm thấy giao đoạn');
    }
    if (phase.phase_status != PhaseStatusEnum.DONE) {
      throw new BadGatewayException(
        'Không thể thanh toán khi giai đoạn chưa hoàn thành',
      );
    }

    if (phase.cost_status != CostStatusEnum.NOT_TRANSFERRED) {
      throw new BadGatewayException('Giai đoạn đã được thanh toán');
    }

    const checkUserInProject: UserProject =
      await this.userProjectService.checkUserInProject(
        user.id,
        phase.project.id,
      );
    if (!checkUserInProject) {
      throw new NotFoundException('Người dùng không thuộc dự án');
    }
    if (
      checkUserInProject.user_project_status != UserProjectStatusEnum.EDIT &&
      checkUserInProject.user_project_status != UserProjectStatusEnum.OWNER
    ) {
      throw new ForbiddenException(
        'Chỉ có doanh nghiệp và người phụ trách được cấp quyền có thể xác nhận đã chuyển tiền',
      );
    }

    // create vnpay url
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const tmnCode = this.configService.get('TmnCode');
    const secretKey = this.configService.get('HashSecret');
    let vnpUrl = this.configService.get('BaseUrl');
    const returnUrl = this.configService.get('ReturnVnPayPaymentUrl');

    const date = new Date();

    const createDate = moment(date).format('YYYYMMDDHHmmss');
    const orderId = moment(date).format('DDHHmmss');
    const amount = phase.actual_cost_total;
    const bankCode = '';

    const orderInfo = `${phaseId}-${new Date().getTime().toString()}`;
    const orderType = orderInfo;
    const locale = 'vn';

    const currCode = 'VND';
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  }

  async paymentVnPayCallback(data: any): Promise<any> {
    let vnp_Params = data;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    const secretKey = this.configService.get('HashSecret');

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(new Buffer(signData, 'utf-8')).digest('hex');

    if (secureHash === signed && vnp_Params['vnp_ResponseCode'] === '00') {
      const phaseId: number = vnp_Params['vnp_OrderInfo'].split('-')[0];
      const phase: Phase = await this.phaseRepository
        .createQueryBuilder('phase')
        .leftJoinAndSelect('phase.project', 'project')
        .leftJoinAndSelect('phase.categories', 'categories')
        .leftJoinAndSelect('project.register_pitchings', 'register_pitching')
        .leftJoinAndSelect('register_pitching.group', 'group')
        .where('phase.id = :phaseId', { phaseId })
        .getOne();

      phase.cost_status = CostStatusEnum.TRANSFERRED;
      await this.phaseRepository.save(phase);

      const categories: Category[] = phase.categories;
      categories.forEach(
        (category) => (category.category_status = CategoryStatusEnum.DONE),
      );
      await this.categoryRepository.save(categories);

      const registerPitching: RegisterPitching =
        phase.project.register_pitchings.find(
          (registerPitching) =>
            registerPitching.register_pitching_status ==
            RegisterPitchingStatusEnum.SELECTED,
        );

      const leaderOfGroup: UserGroup =
        await this.userGroupService.getLeaderOfGroup(registerPitching.group.id);

      const notificationDto: CreateNotificationDto = new CreateNotificationDto(
        NotificationTypeEnum.BUSINESS_TRANSFERRED_MONEY,
        `Doanh nghiệp đã thanh toán giai đoạn ${phase.phase_number} của dự án ${phase.project.name_project}`,
        this.configService.get('MAIL_USER'),
        leaderOfGroup.user.email,
      );
      await this.notificationService.createNotification(notificationDto);

      return {
        redirectUrl: `http://local-culture-projects.onrender.com/project/${phase.project.id}/view`,
      };
    } else {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi thanh toán với VNPay',
      );
    }
  }

  sortObject = (obj: any) => {
    const sorted = {};
    const str = [];
    let key: any;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  };
}
