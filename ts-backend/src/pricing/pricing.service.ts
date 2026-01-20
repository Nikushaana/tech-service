import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { BranchesService } from 'src/branches/branches.service';
import { OrderType } from 'src/common/types/order-type.enum';

@Injectable()
export class PricingService {
    constructor(
        private readonly branchesService: BranchesService,
    ) { }

    async calculatePrice(calculatePriceDto: CalculatePriceDto) {
        const branch = await this.branchesService.getOneBranch(calculatePriceDto.branchId);

        let price: number;

        switch (calculatePriceDto.service_type) {
            case OrderType.FIX_OFF_SITE:
                price = branch.fix_off_site_price;
                break;

            case OrderType.INSTALLATION:
                price = branch.installation_price;
                break;

            case OrderType.FIX_ON_SITE:
                price = branch.fix_on_site_price;
                break;

            default:
                throw new BadRequestException('Invalid service type');
        }

        return { price };
    }
}
