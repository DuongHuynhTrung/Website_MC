import { Module } from '@nestjs/common';
import { BusinessInformationService } from './business-information.service';
import { BusinessInformationController } from './business-information.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInformation } from './entities/business-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessInformation])],
  controllers: [BusinessInformationController],
  providers: [BusinessInformationService],
})
export class BusinessInformationModule {}
