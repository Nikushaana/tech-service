import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminToken } from "src/admin-token/entities/admin-token.entity";
import { CompanyClientToken } from "src/company-client-token/entities/company-client-token.entity";
import { DeliveryToken } from "src/delivery-token/entities/delivery-token.entity";
import { IndividualClientToken } from "src/individual-client-token/entities/individual-client-token.entity";
import { TechnicianToken } from "src/technician-token/entities/technician-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class TokenValidationGuard extends AuthGuard('jwt') {
    constructor(
        @InjectRepository(AdminToken)
        private adminTokenRepo: Repository<AdminToken>,

        @InjectRepository(IndividualClientToken)
        private individualTokenRepo: Repository<IndividualClientToken>,

        @InjectRepository(CompanyClientToken)
        private companyTokenRepo: Repository<CompanyClientToken>,

        @InjectRepository(TechnicianToken)
        private technicianTokenRepo: Repository<TechnicianToken>,
        
        @InjectRepository(DeliveryToken)
        private deliveryTokenRepo: Repository<DeliveryToken>,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const result = (await super.canActivate(context)) as boolean;

        const request = context.switchToHttp().getRequest();
        // Passport sets request.user after JWT validation
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('Invalid JWT payload');
        }

        const authHeader = request.headers['authorization'];
        if (!authHeader) throw new UnauthorizedException('Authorization header missing');

        const token = authHeader.split(' ')[1];
        if (!token) throw new UnauthorizedException('Token not found');

        const role = user.role as 'admin' | 'individual' | 'company' | 'technician' | 'delivery';

        let tokenExists = false;
        if (role === 'admin') {
            tokenExists = !!(await this.adminTokenRepo.findOne({ where: { token } }));
        } else if (role === 'individual') {
            tokenExists = !!(await this.individualTokenRepo.findOne({ where: { token } }));
        } else if (role === 'company') {
            tokenExists = !!(await this.companyTokenRepo.findOne({ where: { token } }));
        } else if (role === 'technician') {
            tokenExists = !!(await this.technicianTokenRepo.findOne({ where: { token } }));
        } else if (role === 'delivery') {
            tokenExists = !!(await this.deliveryTokenRepo.findOne({ where: { token } }));
        }

        if (!tokenExists) {
            throw new UnauthorizedException('Token is invalid or expired');
        }

        return result;
    }
}