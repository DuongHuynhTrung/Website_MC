import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';
import { Repository } from 'typeorm';
import { Evidence } from './entities/evidence.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CostService } from 'src/cost/cost.service';
import { Cost } from 'src/cost/entities/cost.entity';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(Evidence)
    private readonly evidenceRepository: Repository<Evidence>,

    private readonly costService: CostService,
  ) {}

  async createEvidence(
    createEvidenceDto: CreateEvidenceDto,
  ): Promise<Evidence> {
    const cost: Cost = await this.costService.getCostByID(
      createEvidenceDto.costId,
    );
    const evidence: Evidence =
      this.evidenceRepository.create(createEvidenceDto);
    if (!evidence) {
      throw new BadGatewayException('Có lỗi xảy ra khi tạo bằng chứng mới');
    }
    evidence.cost = cost;
    try {
      const result: Evidence = await this.evidenceRepository.save(evidence);
      return await this.getEvidenceById(result.id);
    } catch (error) {
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi lưu chi phí mới',
      );
    }
  }

  async getAllEvidenceOfCost(costId: number): Promise<Evidence[]> {
    await this.costService.getCostByID(costId);
    try {
      const evidences: Evidence[] = await this.evidenceRepository.find({
        relations: ['cost'],
      });
      if (evidences.length === 0) {
        throw new NotFoundException(
          'Không có một bằng chứng nào trong hệ thống',
        );
      }
      const result: Evidence[] = evidences.filter(
        (evidence) => evidence.cost.id == costId,
      );
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getEvidenceById(id: number): Promise<Evidence> {
    try {
      const evidence: Evidence = await this.evidenceRepository.findOne({
        where: { id },
        relations: ['cost'],
      });
      if (!evidence) {
        throw new NotFoundException(`Không tìm thấy chi phí với id ${id}`);
      }
      return evidence;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateEvidence(
    updateEvidenceDto: UpdateEvidenceDto,
  ): Promise<number[]> {
    try {
      const evidences: Evidence[] = await this.evidenceRepository
        .createQueryBuilder('evidence')
        .leftJoinAndSelect('evidence.cost', 'cost')
        .where('cost.id = :costId', { costId: updateEvidenceDto.costId })
        .getMany();
      const result: number[] = [];
      if (evidences.length > 0) {
        evidences.forEach((evidence) => result.push(evidence.id));
        await this.evidenceRepository.remove(evidences);
      }

      if (
        updateEvidenceDto.evidence_url &&
        updateEvidenceDto.evidence_url.length > 0
      ) {
        for (const evidence_url of updateEvidenceDto.evidence_url) {
          const evidence: Evidence = this.evidenceRepository.create({
            evidence_url: evidence_url,
            cost: { id: updateEvidenceDto.costId } as Cost,
          });
          await this.evidenceRepository.save(evidence);
        }
      }
      return result;
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'Có lỗi xảy ra khi cập nhật bằng chứng chi phí',
      );
    }
  }
}
