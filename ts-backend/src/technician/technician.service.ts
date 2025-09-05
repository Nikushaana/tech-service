import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './entities/technician.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';

@Injectable()
export class TechnicianService {
    constructor(
        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,
    ) { }

    // technician

    async getTechnician(technicianId: number) {
        const findTechnician = await this.baseUserService.getUser(technicianId, this.technicianRepo);

        return instanceToPlain(findTechnician);
    }

    async updateTechnician(technicianId: number, updateTechnicianDto: UpdateTechnicianDto) {
        return this.baseUserService.updateUser(technicianId, this.technicianRepo, updateTechnicianDto);
    }

    async changePassword(technicianId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.technicianRepo, technicianId, changePasswordDto);
    }

    // send and verify sent code

    async sendChangeNumberCode(phoneDto: PhoneDto) {
        const result = await this.verificationCodeService.sendCode(phoneDto, 'change-number');

        return { message: `Code ${result.code} sent to ${result.phone}`, code: result.code };
    }

    async changeNumber(technicianId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.technicianRepo, technicianId, changeNumberDto);
    }
}
