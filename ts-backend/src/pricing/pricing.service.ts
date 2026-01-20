import { Injectable } from '@nestjs/common';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { BranchesService } from 'src/branches/branches.service';

@Injectable()
export class PricingService {
    constructor(
        private readonly branchesService: BranchesService,
    ) { }

    async calculatePrice(dto: CalculatePriceDto) {
        const branch = await this.branchesService.getOneBranch(dto.branchId);

        if(dto.service_type == 'fix_off_site')
        branch
    }
}
