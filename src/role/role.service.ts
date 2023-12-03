import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from 'src/role/enum/role.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async getRoleByRoleName(role_name: RoleEnum): Promise<Role> {
    try {
      const role = await this.roleRepository.findOneBy({ role_name });
      if (!role) {
        throw new NotFoundException(`Role ${role_name} not found`);
      }
      return role;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
