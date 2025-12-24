import { Body, Controller, Delete, Headers, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PhoneDto, ResetPasswordDto, VerifyCodeDto } from 'src/verification-code/dto/verification-code.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokenValidationGuard } from './guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { RegisterIndAdmTechDelDto } from './dto/register-ind-adm-tech-del.dto';

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

    // reset password
    @Post('send-reset-password-code')
    async SendResetPasswordCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendResetPasswordCode(phoneDto);
    }

    @Post('reset-password')
    async ResetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    // login individual or company
    @Post('login-client')
    async IndividualOrCompanyLogin(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto, "individualOrCompany");
    }
}

@Controller('auth/admin')
export class AdminAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async AdminRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "admin");
    }

    @Post('login')
    async AdminLogin(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto, "admin");
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Delete('logout')
    async AdminLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'admin');
    }
}

@Controller('auth/individual')
export class IndividualAuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async IndividualRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "individual");
    }

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

    @Post('register')
    async CompanyRegister(
        @Body() registerCompanyDto: RegisterCompanyDto,
    ) {
        return this.authService.register(registerCompanyDto, "company");
    }

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
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "technician");
    }

    @Post('login')
    async TechnicianLogin(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto, "technician");
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Delete('logout')
    async TechnicianLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'technician');
    }
}

@Controller('auth/delivery')
export class DeliveryAuthController {
    constructor(private readonly authService: AuthService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('send-register-code')
    async DeliverySendRegisterCode(@Body() phoneDto: PhoneDto) {
        return this.authService.sendRegisterCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('verify-register-code')
    async DeliveryVerifyRegisterCode(@Body() verifyCodeDto: VerifyCodeDto) {
        return this.authService.verifyRegisterCode(verifyCodeDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin')
    @Post('register')
    async DeliveryRegister(
        @Body() registerIndAdmTechDelDto: RegisterIndAdmTechDelDto,
    ) {
        return this.authService.register(registerIndAdmTechDelDto, "delivery");
    }

    @Post('login')
    async DeliveryLogin(@Body() loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto, "delivery");
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('delivery')
    @Delete('logout')
    async DeliveryLogout(@Headers('authorization') authHeader: string) {
        return this.authService.logout(authHeader, 'delivery');
    }
}
