import { Module } from '@nestjs/common';
import { ResponsiblePersonController } from './responsible_person.controller';
import { ResponsiblePersonService } from './responsible_person.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsiblePerson } from './entities/responsible_person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResponsiblePerson])],
  controllers: [ResponsiblePersonController],
  providers: [ResponsiblePersonService],
})
export class ResponsiblePersonModule {}
