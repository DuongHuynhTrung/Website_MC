import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateSupportDto } from './dto/create-support.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Support } from './entities/support.entity';
import { Repository } from 'typeorm';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Support)
    private readonly supportRepository: Repository<Support>,

    private readonly emailService: EmailService,
  ) {}

  async createSupport(createSupportDto: CreateSupportDto): Promise<Support> {
    const support = this.supportRepository.create(createSupportDto);
    if (!support) {
      throw new BadGatewayException('Có lỗi xảy ra tạo gửi yêu cầu hỗ trợ');
    }
    const result = await this.supportRepository.save(support);
    if (!result) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi gửi yêu cầu hỗ trợ',
      );
    }
    await this.emailService.sendSupport(support);

    return support;
  }

  async getSupports(): Promise<Support[]> {
    const supports: Support[] = await this.supportRepository.find();
    if (!supports) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi truy xuất tất cả yêu cầu hỗ trợ',
      );
    }
    return supports.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getSupportById(id: number): Promise<Support> {
    const support: Support = await this.supportRepository.findOneBy({ id });
    if (!support) {
      throw new InternalServerErrorException(
        `Có lỗi xảy ra khi truy xuất yêu cầu hỗ trợ`,
      );
    }
    return support;
  }
}
