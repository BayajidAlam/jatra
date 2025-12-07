import {
  Controller,
  Get,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("users")
@ApiBearerAuth("JWT-auth")
@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("verify-token")
  @ApiOperation({ summary: "Verify JWT token and get user info" })
  @ApiResponse({ status: 200, description: "Token is valid, returns user info" })
  @ApiResponse({ status: 401, description: "Unauthorized - invalid token" })
  async verifyToken(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }
}
