import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'trulySecretKey'),
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.authService.validateUser(payload);
      // Add payload fields to the user object for proper identification
      return {
        ...user,
        id: user.id, // Ensure the ID is explicitly set
        sub: payload.sub, // Keep sub for backward compatibility
        role: user.role, // Add role for authorization checks
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
