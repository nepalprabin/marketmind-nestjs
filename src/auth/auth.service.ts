// src/auth/auth.service.ts
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateOAuthUser(userDetails: any) {
    try {
      // Check if user exists
      let user = await this.usersService.findByEmail(userDetails.email);

      if (!user) {
        // Create a new user
        this.logger.log(`Creating new user with email: ${userDetails.email}`);
        user = await this.usersService.create({
          email: userDetails.email,
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          picture: userDetails.picture,
          googleId: userDetails.googleId,
          isEmailVerified: true, // Google emails are verified
        });
      } else if (!user.googleId) {
        // Update existing user with Google ID
        this.logger.log(
          `Updating existing user with Google ID: ${userDetails.googleId}`,
        );
        user = await this.usersService.update(user.id, {
          googleId: userDetails.googleId,
          isEmailVerified: true,
          picture: userDetails.picture || user.picture,
        });
      }

      return user;
    } catch (error) {
      this.logger.error(`Error in validateOAuthUser: ${error.message}`);
      throw error;
    }
  }

  login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture,
        },
      };
    } catch (error) {
      this.logger.error(`Error in login: ${error.message}`);
      throw new UnauthorizedException('Login failed');
    }
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.error(`Error verifying token: ${error.message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }
  generateTestToken(payload: any) {
    try {
      this.logger.log(`Generating test token for: ${JSON.stringify(payload)}`);
      return this.jwtService.sign(payload);
    } catch (error) {
      this.logger.error(`Error generating test token: ${error.message}`);
      throw new UnauthorizedException('Failed to generate test token');
    }
  }
}
