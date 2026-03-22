import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Req,
    UseGuards,
    Res,
} from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { TokenValidationGuard } from 'src/auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { RequestInfo } from 'src/common/types/request-info';
import type { Response } from 'express';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @UseGuards(TokenValidationGuard, RolesGuard)
    @Roles('admin', 'individual', 'company')
    @Get(':id/download')
    async downloadInvoice(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: RequestInfo,
        @Res() res: Response
    ) {
        const { buffer, filename } = await this.invoiceService.generateInvoicePdf(id, req.user);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=${filename}`,
        });

        res.send(buffer);
    }
}