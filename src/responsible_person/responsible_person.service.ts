import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponsiblePerson } from './entities/responsible_person.entity';
import { CreateResponsiblePersonDto } from './dto/create-responsible_person.dto';
import { UpdateResponsiblePersonDto } from './dto/update-responsible_person.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ResponsiblePersonService {
  constructor(
    @InjectRepository(ResponsiblePerson)
    private readonly responsiblePersonRepository: Repository<ResponsiblePerson>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createResponsiblePerson(
    createResponsiblePersonDto: CreateResponsiblePersonDto,
  ): Promise<ResponsiblePerson> {
    const responsiblePerson = this.responsiblePersonRepository.create(
      createResponsiblePersonDto,
    );
    if (!responsiblePerson) {
      throw new BadRequestException(
        'Có lỗi khi tạo Người chịu trách nhiệm. Vui lòng kiểm tra lại thông tin!',
      );
    }
    console.log(createResponsiblePersonDto);
    const business = await this.userRepository.findOne({
      where: { email: createResponsiblePersonDto.businessEmail },
    });
    if (!business) {
      throw new NotFoundException(
        `Không tìm thấy doanh nghiệp với email ${createResponsiblePersonDto.businessEmail}`,
      );
    }
    responsiblePerson.business = business;
    try {
      const result =
        await this.responsiblePersonRepository.save(responsiblePerson);
      if (!result) {
        throw new InternalServerErrorException(
          'Có lỗi khi tạo Người chịu trách nhiệm. Vui lòng kiểm tra lại thông tin!',
        );
      }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async getResponsiblePersonOfBusiness(
    businessEmail: string,
  ): Promise<ResponsiblePerson> {
    try {
      const responsiblePersons: ResponsiblePerson[] =
        await this.responsiblePersonRepository.find({
          relations: ['business'],
        });
      const business = await this.userRepository.findOne({
        where: { email: businessEmail },
      });
      if (!business) {
        throw new NotFoundException(
          `Không tìm thấy doanh nghiệp với email ${businessEmail}`,
        );
      }
      const responsiblePerson = responsiblePersons.find(
        (responsible) => responsible.business.id === business.id,
      );
      if (!responsiblePerson) {
        throw new NotFoundException(
          'Không tìm thấy người phụ trách của doanh nghiệp',
        );
      }
      return responsiblePerson;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getResponsiblePersonByEmail(email: string): Promise<ResponsiblePerson> {
    try {
      const responsiblePerson =
        await this.responsiblePersonRepository.findOneBy({ email });
      if (!responsiblePerson) {
        throw new NotFoundException('Không tìm thấy Người chịu trách nhiệm!');
      }
      return responsiblePerson;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getResponsiblePerson(email: string): Promise<ResponsiblePerson> {
    try {
      return await this.responsiblePersonRepository.findOneBy({ email });
    } catch (error) {
      throw new InternalServerErrorException(
        `Something when wrong while getResponsiblePerson` + error.message,
      );
    }
  }

  async searchResponsiblePersonByEmail(
    searchEmail: string,
  ): Promise<ResponsiblePerson[]> {
    try {
      console.log(searchEmail);
      const responsiblePerson = await this.responsiblePersonRepository.find({
        where: {
          email: Like(`%${searchEmail}%`),
        },
      });
      if (!responsiblePerson || responsiblePerson.length === 0) {
        throw new NotFoundException(
          `Không tìm thấy Người chịu trách nhiệm với tìm kiếm: ${searchEmail}`,
        );
      }
      return responsiblePerson;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateResponsiblePerson(
    updateResponsiblePersonDtp: UpdateResponsiblePersonDto,
  ): Promise<ResponsiblePerson> {
    try {
      const responsiblePerson = await this.getResponsiblePersonByEmail(
        updateResponsiblePersonDtp.email,
      );

      const updatedResponsiblePerson =
        await this.responsiblePersonRepository.update(
          responsiblePerson.id,
          updateResponsiblePersonDtp,
        );
      if (!updatedResponsiblePerson) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi cập nhật thông tin của người chịu trách nhiệm',
        );
      }
      return await this.getResponsiblePersonByEmail(responsiblePerson.email);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
