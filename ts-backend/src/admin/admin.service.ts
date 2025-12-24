import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { BaseUserService } from 'src/common/services/base-user/base-user.service';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,

        private readonly baseUserService: BaseUserService,
    ) { }

    // admin info
    async getAdmin(adminId: number) {
        const findAdmin = await this.baseUserService.getUser(adminId, this.adminRepo);

        return instanceToPlain(findAdmin);
    }
}
