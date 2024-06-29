import { PartialType } from '@nestjs/swagger';
import { CreateProjectWithTokenDto } from './create-project-with-token.dto';

export class CreateProjectWithoutTokenDto extends PartialType(
  CreateProjectWithTokenDto,
) {}
