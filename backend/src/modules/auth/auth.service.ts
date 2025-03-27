import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { UsersService } from '../../modules/users/users.service';
import { RegisterDto } from '../../modules/auth/dto/register.dto';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { JwtPayload } from '../../modules/auth/interfaces/jwt-payload.interface';
import { LoggingService } from '../../modules/logging/logging.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private loggingService: LoggingService,
  ) {
    this.loggingService.setContext('AuthService');
  }

  async register(registerDto: RegisterDto) {
    this.loggingService.debug(`Processing user registration`, 'register', {
      email: registerDto.email,
      name: registerDto.name,
    });

    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        this.loggingService.warn(`Registration failed: Email already exists`, 'register', {
          email: registerDto.email,
        });
        throw new UnauthorizedException('User with this email already exists');
      }

      // Hash password
      this.loggingService.debug(`Hashing password`, 'register');
      const hashedPassword = await this.hashPassword(registerDto.password);

      // Create new user
      const user = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });
      
      // Update acceptedTerms field separately if needed
      if (registerDto.acceptTerms) {
        await this.usersService.update(user.id, { acceptedTerms: true });
      }

      // Generate tokens
      this.loggingService.debug(`Generating auth tokens for new user`, 'register', {
        userId: user.id,
      });
      const tokens = await this.generateTokens(user.id);

      this.loggingService.log(`User registered successfully`, 'register', {
        userId: user.id,
        email: user.email,
      });

      return {
        user: this.usersService.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Re-throw already logged errors
        throw error;
      }
      this.loggingService.error(
        `Registration error: ${error.message}`,
        error.stack,
        'register'
      );
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    this.loggingService.debug(`Login attempt`, 'login', {
      email: loginDto.email,
    });

    try {
      // Find user by email
      const user = await this.usersService.findByEmail(loginDto.email);
      
      if (!user) {
        this.loggingService.warn(`Login failed: User not found`, 'login', {
          email: loginDto.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      this.loggingService.debug(`Verifying password`, 'login', {
        userId: user.id,
      });
      const isPasswordValid = await this.verifyPassword(
        user.password,
        loginDto.password,
      );

      if (!isPasswordValid) {
        this.loggingService.warn(`Login failed: Invalid password`, 'login', {
          userId: user.id,
          email: user.email,
        });
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate tokens
      this.loggingService.debug(`Generating auth tokens`, 'login', {
        userId: user.id,
      });
      const tokens = await this.generateTokens(user.id);

      this.loggingService.log(`User logged in successfully`, 'login', {
        userId: user.id,
        email: user.email,
      });

      return {
        user: this.usersService.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Re-throw already logged errors
        throw error;
      }
      this.loggingService.error(
        `Login error: ${error.message}`,
        error.stack,
        'login'
      );
      throw error;
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    this.loggingService.debug(`Token refresh request`, 'refreshToken', {
      userId,
    });

    try {
      // Verify refresh token (in a real app, you'd check against stored refresh tokens)
      const user = await this.usersService.findById(userId);
      
      if (!user) {
        this.loggingService.warn(`Token refresh failed: User not found`, 'refreshToken', {
          userId,
        });
        throw new UnauthorizedException('Invalid token');
      }

      // Generate new tokens
      this.loggingService.debug(`Generating new auth tokens`, 'refreshToken', {
        userId: user.id,
      });
      const tokens = await this.generateTokens(user.id);

      this.loggingService.log(`Token refreshed successfully`, 'refreshToken', {
        userId: user.id,
      });

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Re-throw already logged errors
        throw error;
      }
      this.loggingService.error(
        `Token refresh error: ${error.message}`,
        error.stack,
        'refreshToken'
      );
      throw error;
    }
  }

  async validateUser(payload: JwtPayload) {
    this.loggingService.debug(`Validating JWT payload`, 'validateUser', {
      userId: payload.sub,
    });

    try {
      const user = await this.usersService.findById(payload.sub);
      
      if (!user) {
        this.loggingService.warn(`JWT validation failed: User not found`, 'validateUser', {
          userId: payload.sub,
        });
        throw new UnauthorizedException('Invalid token');
      }
      
      this.loggingService.debug(`JWT payload validated successfully`, 'validateUser', {
        userId: user.id,
      });
      
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Re-throw already logged errors
        throw error;
      }
      this.loggingService.error(
        `JWT validation error: ${error.message}`,
        error.stack,
        'validateUser'
      );
      throw error;
    }
  }

  private async generateTokens(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, id: userId }, // Include both sub and id for compatibility
        { expiresIn: '15m' }, // Short-lived access token
      ),
      this.jwtService.signAsync(
        { sub: userId, id: userId }, // Include both sub and id for compatibility
        { expiresIn: '7d' }, // Longer-lived refresh token
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }

  private async verifyPassword(
    hashedPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}
