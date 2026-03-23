import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus, InvoiceType } from './entities/invoice.entity';
import * as puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

  async generateInvoiceFile(id: number): Promise<{
    buffer: Buffer;
    filename: string;
  }> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // 🧾 HTML template (you can fully customize this)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      color: #333;
    }

    h1 {
      text-align: center;
      margin-bottom: 10px;
    }

    .status {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      color: ${invoice.status === 'PAID' ? 'green' : 'orange'};
    }

    .info {
      margin-top: 20px;
    }

    .info p {
      margin: 5px 0;
    }

    .table {
      width: 100%;
      margin-top: 30px;
      border-collapse: collapse;
    }

    .table th, .table td {
      border: 1px solid #ddd;
      padding: 10px;
    }

    .table th {
      background-color: #f5f5f5;
      text-align: left;
    }

    .total {
      margin-top: 20px;
      text-align: right;
      font-size: 18px;
      font-weight: bold;
    }

    .footer {
      margin-top: 40px;
      font-size: 12px;
      text-align: center;
      color: #777;
    }
  </style>
</head>

<body>
  <h1>Invoice #${invoice.id}</h1>

  <div class="status">
    Status: ${invoice.status}
  </div>

  <div class="info">
    <p><strong>Order ID:</strong> ${invoice.order_id}</p>
    <p><strong>Type:</strong> ${invoice.type}</p>
    <p><strong>Created At:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
    <p><strong>Paid At:</strong> ${invoice.paid_at
        ? new Date(invoice.paid_at).toLocaleDateString()
        : 'Not paid yet'
      }</p>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Service Type</th>
        <th>Status</th>
        <th>Amount</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>${invoice.type}</td>
        <td>${invoice.status}</td>
        <td>${invoice.amount} ${invoice.currency}</td>
      </tr>
    </tbody>
  </table>

  <div class="total">
    Total: ${invoice.amount} ${invoice.currency}
  </div>

  <div class="footer">
    Thank you for using our service.
  </div>
</body>
</html>
`;

    const isProduction = process.env.NODE_ENV === 'production';

    // 🚀 Generate PDF
    const browser = await puppeteer.launch(
      isProduction
        ? {
          args: chromium.args,
          executablePath: await chromium.executablePath(),
          headless: true,
        }
        : {
          headless: true,
        }
    );

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    const buffer = Buffer.from(pdfUint8);

    await browser.close();

    return {
      buffer,
      filename: `invoice-${invoice.id}.pdf`,
    };
  }
}