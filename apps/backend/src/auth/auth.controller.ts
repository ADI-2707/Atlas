import { Controller, Post, Body, Ip, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new organization and admin user' })
  @ApiResponse({ status: 201, description: 'Organization and admin user registered successfully' })
  async register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user and get access/refresh tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  async refresh(
    @Body() dto: RefreshDto,
    @Ip() ip: string,
    @Req() req: Request,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    return this.authService.refresh(dto, ip, userAgent);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and terminate active session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @CurrentUser() user: any,
    @Ip() ip: string,
  ) {
    return this.authService.logout(user.sessionId, user.id, user.organizationId, ip);
  }

  @Post('complete-setup')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark the onboarding setup as completed for this user (one-time, permanent)' })
  @ApiResponse({ status: 200, description: 'Setup marked as completed' })
  async completeSetup(@CurrentUser() user: any) {
    return this.authService.completeSetup(user.id);
  }
}

