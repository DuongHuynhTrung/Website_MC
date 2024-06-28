import { PartialType } from '@nestjs/swagger';
import { CreateUserProjectDto } from './create-user-project.dto';

export class UpdateUserProjectDto extends PartialType(CreateUserProjectDto) {}
