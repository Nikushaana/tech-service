import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import type { RequestInfo } from 'src/common/types/request-info';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';

@Controller('technician')
export class TechnicianController {
    constructor(
        private readonly technicianService: TechnicianService,
    ) { }

    // technician

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Get('')
    async getTechnician(@Req() req: RequestInfo) {
        return this.technicianService.getTechnician(req.user.id);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Patch('')
    async updateTechnician(@Req() req: RequestInfo, @Body() updateTechnicianDto: UpdateTechnicianDto) {
        return this.technicianService.updateTechnician(req.user.id, updateTechnicianDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Patch('change-password')
    async changePassword(@Req() req: RequestInfo, @Body() changePasswordDto: ChangePasswordDto) {
        return this.technicianService.changePassword(req.user.id, changePasswordDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Post('send-change-number-code')
    async sendChangeNumberCode(@Body() phoneDto: PhoneDto) {
        return this.technicianService.sendChangeNumberCode(phoneDto);
    }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('technician')
    @Post('change-number')
    async changeNumber(@Req() req: RequestInfo, @Body() changeNumberDto: ChangeNumberDto) {
        return this.technicianService.changeNumber(req.user.id, changeNumberDto);
    }
}
