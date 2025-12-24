import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician } from './entities/technician.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { instanceToPlain } from 'class-transformer';
import { UpdateTechnicianDto } from './dto/update-technician.dto';
import { ChangePasswordDto } from 'src/common/services/base-user/dto/change-password.dto';
import { ChangeNumberDto, PhoneDto } from 'src/verification-code/dto/verification-code.dto';
import { UserFilterDto } from 'src/common/services/base-user/dto/user-filter.dto';
import { UpdateAdminIndividualTechnicianDeliveryDto } from 'src/admin/dto/update-adm-ind-tech-del.dto';
import * as bcrypt from 'bcrypt';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class TechnicianService {
    constructor(
        @InjectRepository(Technician)
        private technicianRepo: Repository<Technician>,

        private readonly baseUserService: BaseUserService,

        private readonly verificationCodeService: VerificationCodeService,

        private readonly cloudinaryService: CloudinaryService,
    ) { }

    // technician

    async getTechnicians(userFilterDto: UserFilterDto) {
        const findTechnicians = await this.baseUserService.getUsers(this.technicianRepo, userFilterDto);

        return instanceToPlain(findTechnicians);
    }

    async getAdminOneTechnician(technicianId: number) {
        const findOneTechnician = await this.baseUserService.getUser(technicianId, this.technicianRepo);

        return instanceToPlain(findOneTechnician)
    }

    async updateAdminOneTechnician(technicianId: number, updateAdminIndividualTechnicianDeliveryDto: UpdateAdminIndividualTechnicianDeliveryDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(technicianId, this.technicianRepo, updateAdminIndividualTechnicianDeliveryDto, images, "admin");
    }

    async getTechnician(technicianId: number) {
        const findTechnician = await this.baseUserService.getUser(technicianId, this.technicianRepo);

        return instanceToPlain(findTechnician);
    }

    async updateTechnician(technicianId: number, updateTechnicianDto: UpdateTechnicianDto, images: Express.Multer.File[] = []) {
        return this.baseUserService.updateUser(technicianId, this.technicianRepo, updateTechnicianDto, images);
    }

    async changePassword(technicianId: number, changePasswordDto: ChangePasswordDto) {
        return this.baseUserService.changePassword(this.technicianRepo, technicianId, changePasswordDto);
    }

    // send and verify sent code
    async sendChangeNumberCode(phoneDto: PhoneDto) {
        return this.verificationCodeService.sendCode(phoneDto, 'change-number');
    }

    async changeNumber(technicianId: number, changeNumberDto: ChangeNumberDto) {
        return this.baseUserService.changeNumber(this.technicianRepo, technicianId, changeNumberDto);
    }
}
