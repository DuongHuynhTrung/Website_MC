import * as xlsx from 'xlsx';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessInformation } from './entities/business-information.entity';

@Injectable()
export class BusinessInformationService {
  constructor(
    @InjectRepository(BusinessInformation)
    private businessRepository: Repository<BusinessInformation>,
  ) {}

  async importBusinessesFromExcel(buffer: Buffer): Promise<void> {
    // Read the Excel file from the buffer
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    // Get the name of the first sheet
    const sheetName = workbook.SheetNames[0];

    // Get the sheet and convert it to JSON
    const sheet = workbook.Sheets[sheetName];
    const rows: any[][] = xlsx.utils.sheet_to_json(sheet, {
      header: 1, // Read by rows
      defval: '', // Default empty value if a cell is empty
    });

    // Skip the first two rows and get the data starting from the 3rd row
    const data: any[][] = rows.slice(2);

    // Iterate through the data starting from the 3rd row
    for (const row of data) {
      const [
        STT,
        businessName, // Tên Doanh nghiệp/Hộ kinh doanh
        businessField, // Lĩnh vực kinh doanh
        shortIntro, // Giới thiệu ngắn
        address, // Địa chỉ
        website, // Website/Fanpage
        contactName, // Họ và tên
        position, // Chức vụ
        phoneNumber, // Số điện thoại
        email, // Email
        otherContactInfo, // Thông tin liên hệ khác (nếu có)
      ] = row as [
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
      ]; // Cast row to array of strings

      // Only save to the database if the necessary fields are present
      if (businessName && contactName) {
        const business = new BusinessInformation();
        business.businessName = businessName;
        business.businessField = businessField;
        business.shortIntro = shortIntro;
        business.address = address;
        business.website = website;
        business.contactName = contactName;
        business.position = position;
        business.phoneNumber = phoneNumber;
        business.email = email;
        business.otherContactInfo = otherContactInfo;

        // Save the information to the database
        await this.businessRepository.save(business);
      }
    }
  }

  async getAllBusinessInfo(): Promise<BusinessInformation[]> {
    try {
      const businessInformationList: BusinessInformation[] =
        await this.businessRepository.find();
      if (!businessInformationList) {
        throw new InternalServerErrorException(
          'Có lỗi xảy ra khi truy xuất tất cả thông tin doanh nghiệp',
        );
      }
      return businessInformationList;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async clearAllBusinessInfo(): Promise<string> {
    try {
      await this.businessRepository.clear();
      return 'Xóa thành công';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
