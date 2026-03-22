import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) { }

  async createInvoice(data: {
    orderId: number;
    amount: number;
    type: InvoiceType;
  }) {
    const invoice = this.invoiceRepo.create({
      order_id: data.orderId,
      amount: data.amount,
      status: InvoiceStatus.PENDING,
      type: data.type,
    });

    return this.invoiceRepo.save(invoice);
  }

  async markAsPaidById(invoiceId: number) {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    invoice.status = InvoiceStatus.PAID;
    invoice.paid_at = new Date();

    return this.invoiceRepo.save(invoice);
  }
}