import { PartialType } from '@nestjs/swagger';
import { CreateRegisterPitchingDto } from './create-register-pitching.dto';

export class UpdateRegisterPitchingDto extends PartialType(CreateRegisterPitchingDto) {}
