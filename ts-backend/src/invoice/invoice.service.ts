import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async generateInvoicePdf(id: number, user: any) {
    // Fetch invoice and check permissions
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['order', 'order.individual', 'order.company'],
    });

    if (!invoice) throw new NotFoundException();

    if (
      user.role !== 'admin' &&
      invoice.order.individual?.id !== user.id &&
      invoice.order.company?.id !== user.id
    ) {
      throw new ForbiddenException('You cannot access this invoice');
    }

    // Generate PDF (example with pdfkit)
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => { });

    // Example content
    doc.text(`Invoice #${invoice.id}`);
    doc.text(`Amount: ${invoice.amount} ${invoice.currency}`);
    doc.text(`Status: ${invoice.status}`);
    doc.end();

    // Convert chunks to Buffer
    const buffer = Buffer.concat(chunks);

    const filename = `invoice-${invoice.id}.pdf`;

    // Return an object, not just Buffer
    return { buffer, filename };
  }
}