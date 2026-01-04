import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../common/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto) {
    const { nid, email, phone, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ nid }, { email }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.nid === nid) {
        throw new ConflictException("NID already registered");
      }
      if (existingUser.email === email) {
        throw new ConflictException("Email already registered");
      }
      if (existingUser.phone === phone) {
        throw new ConflictException("Phone number already registered");
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        nid,
        email,
        phone,
        name,
        passwordHash,
      },
      select: {
        id: true,
        nid: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      user,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { identifier, password } = loginDto;

    // Find user by NID, email, or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ nid: identifier }, { email: identifier }, { phone: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.role, user.email);

    return {
      user: {
        id: user.id,
        nid: user.nid,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    // Verify refresh token
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
      });
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    // Check if refresh token exists in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      throw new UnauthorizedException("Refresh token not found");
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new UnauthorizedException("Refresh token expired");
    }

    // Get user details for new token payload
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Generate new tokens
    const tokens = await this.generateTokens(user.id, user.role, user.email);

    // Delete old refresh token
    try {
      await this.prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
    } catch (error) {
      // Ignore if token already deleted to prevent race conditions
    }

    return tokens;
  }

  async logout(refreshToken: string) {
    // Delete refresh token from database
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return { message: "Logged out successfully" };
  }

  private async generateTokens(userId: string, role: string, email: string) {
    // Add unique identifier to payload to ensure token uniqueness
    const payload = { 
      sub: userId, 
      role, 
      email,
      jti: crypto.randomUUID() 
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_ACCESS_SECRET"),
      expiresIn: this.configService.get("JWT_ACCESS_EXPIRY"),
    });

    // Generate refresh token
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get("JWT_REFRESH_SECRET"),
      expiresIn: this.configService.get("JWT_REFRESH_EXPIRY"),
    });

    // Store refresh token in database
    const expiryTime = new Date();
    expiryTime.setDate(expiryTime.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: expiryTime,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
