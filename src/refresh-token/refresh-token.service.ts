import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PayloadJwtDto } from 'src/auth/dto/payload-jwt.dto';

@Injectable()
export class RefreshTokenService {
  constructor(private jwtService: JwtService) {}

  generateRefreshToken(payload: PayloadJwtDto): string {
    // Generate and sign a refresh token
    return this.jwtService.sign(payload);
  }
}
