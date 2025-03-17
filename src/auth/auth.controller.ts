// src/auth/auth.controller.ts
import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Response } from 'express';

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
  verifyToken(@Req() req) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return { isValid: false };
      }

      const decoded = this.authService.verifyToken(token);
      return { isValid: true, user: decoded };
    } catch (error) {
      return { isValid: false };
    }
  }
}
