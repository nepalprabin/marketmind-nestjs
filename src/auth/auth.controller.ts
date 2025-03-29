// src/auth/auth.controller.ts
import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger,
  Post,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Initiates the Google OAuth2 login flow
    // This route doesn't need to return anything as it redirects to Google
    this.logger.log('Initiating Google OAuth flow');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    // Handle the Google OAuth2 callback
    this.logger.log('Google OAuth callback received');

    try {
      const jwt = this.authService.login(req.user);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      // Redirect to frontend with token
      const redirectUrl = `${frontendUrl}/auth/success?token=${jwt.access_token}`;
      this.logger.log(`Redirecting to: ${redirectUrl}`);

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error in Google callback: ${error.message}`);
      res.redirect(
        `${this.configService.get<string>('FRONTEND_URL')}/auth/error`,
      );
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    this.logger.log(`Profile requested for user: ${req.user.email}`);
    return req.user;
  }

  @Get('verify')
  async verifyToken(@Req() req) {
    try {
      console.log('----', req.headers.authorization);
      console.log('Incoming Headers:', req.headers);
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        console.error('No token provided');
        return { isValid: false };
      }

      const decoded = await this.authService.verifyToken(token);
      return { isValid: true, user: decoded };
    } catch (error) {
      console.error('Token verification error:', error);
      return { isValid: false };
    }
  }

  @Post('test-token')
  @ApiOperation({
    summary: 'Generate a test token for API testing',
    description:
      'FOR DEVELOPMENT USE ONLY. Generates a JWT token for a test user to use in Swagger UI.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'test@example.com' },
        userId: {
          type: 'string',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a JWT token for testing',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        decoded_payload: { type: 'object' },
      },
    },
  })
  generateTestToken(@Body() body: { email?: string; userId?: string }) {
    // Only allow in development environment
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      return { error: 'This endpoint is not available in production' };
    }

    const email = body.email || 'test@example.com';
    const userId = body.userId || '550e8400-e29b-41d4-a716-446655440000';

    const payload = { email: email, sub: userId };
    const token = this.authService.generateTestToken(payload);

    return {
      access_token: token,
      decoded_payload: payload,
      usage:
        'Use this token in Swagger UI by clicking the Authorize button and entering: Bearer your_token_here',
    };
  }
}
