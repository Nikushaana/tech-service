import { Body, Controller, Delete, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PhoneDto, ResetPasswordDto, VerifyCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterAdminDto } from './dto/register-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokenValidationGuard } from './guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';



@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // register

    @Post('send-register-code')
    async SendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @Post('verify-register-code')
    async VerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    @Post('register')
    async Register(
        @Body() RegisterDto: RegisterDto,
    ) {
        return this.authService.register(RegisterDto);
    }

    // reset password

    @Post('send-reset-password-code')
    async SendResetPasswordCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendResetPasswordCode(phoneDto);
    }

    @Post('reset-password')
    async ResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // login

    @Post('login')
    async Login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }
}

@Controller('auth/admin')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async registerAdmin(@Body() dto: RegisterAdminDto) {
        return this.authService.adminRegister(dto);
    }

    @Post('login')
    async AdminLogin(@Body() loginAdminDto: LoginAdminDto) {
        return this.authService.adminLogin(loginAdminDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('logout')
    async AdminLogout(@Headers('authorization') authHeader: string) {
        return this.authService.adminLogout(authHeader);
    }
}

@Controller('auth/individual')
export class IndividualAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('individual')
    @Delete('logout')
    async IndividualLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'individual');
    }
}

@Controller('auth/company')
export class CompanyAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('company')
    @Delete('logout')
    async CompanyLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'company');
    }
}

@Controller('auth/technician')
export class TechnicianAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('send-register-code')
    async TechnicianSendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('verify-register-code')
    async TechnicianVerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('register')
    async TechnicianRegister(
        @Body() registerDto: RegisterDto,
    ) {
        return this.authService.register(registerDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Delete('logout')
    async TechnicianLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'technician');
    }
}
