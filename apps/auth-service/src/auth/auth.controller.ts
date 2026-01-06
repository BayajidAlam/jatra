import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({
    status: 409,
    description: "NID, email, or phone already registered",
  })
  @ApiResponse({ status: 400, description: "Validation failed" })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.register(registerDto);

    // Set cookies
    this.setCookies(response, result.accessToken, result.refreshToken);

    // Return user data without tokens
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      message: "Registration successful",
    };
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with NID, email, or phone" })
  @ApiResponse({
    status: 200,
    description: "Login successful, tokens set in HttpOnly cookies",
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
    const result = await this.authService.login(loginDto);

    // Set cookies
    this.setCookies(response, result.accessToken, result.refreshToken);

    // Return user data without tokens
    return {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      message: "Login successful",
    };
  }

  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiResponse({ status: 200, description: "Token refreshed successfully" })
  @ApiResponse({ status: 401, description: "Invalid or expired refresh token" })
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // Get refresh token from cookie
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Set new cookies
    this.setCookies(response, result.accessToken, result.refreshToken);

    return {
      message: "Token refreshed successfully",
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and invalidate refresh token" })
  @ApiResponse({ status: 200, description: "Logged out successfully" })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    // Get refresh token from cookie
    const refreshToken = request.cookies?.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    this.clearCookies(response);

    return {
      message: "Logged out successfully",
    };
  }

  // Helper method to set cookies
  private setCookies(
    response: Response,
    accessToken: string,
    refreshToken: string
  ) {
    const isProduction = process.env.NODE_ENV === "production";

    // Set access token cookie (15 minutes)
    response.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    // Set refresh token cookie (7 days)
    response.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async me(@Req() request: any) {
    const user = request.user;
    return {
      user: user,
    };
  }

  // Helper method to clear cookies
  private clearCookies(response: Response) {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      path: "/",
    };

    response.clearCookie("accessToken", cookieOptions);
    response.clearCookie("refreshToken", cookieOptions);
  }
}
