import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrderStatus } from '@prisma/client';
import { createTransport, Transporter } from 'nodemailer';

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PROCESSING: 'is being processed',
  SHIPPED: 'has shipped',
  DELIVERED: 'has been delivered',
  CANCELLED: 'has been cancelled',
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): Transporter | null {
    if (this.transporter) {
      return this.transporter;
    }

    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<string>('SMTP_PORT');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP is not configured; skipping email send');
      return null;
    }

    this.transporter = createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
    return this.transporter;
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const transporter = this.getTransporter();
    if (!transporter) {
      return;
    }

    const from =
      this.config.get<string>('SMTP_FROM') ??
      this.config.get<string>('SMTP_USER');

    try {
      await transporter.sendMail({ from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}`, err as Error);
    }
  }

  async sendOrderStatusUpdate(
    to: string,
    orderNumber: string,
    status: OrderStatus,
  ): Promise<void> {
    const subject = `Your order ${orderNumber} ${STATUS_MESSAGES[status]}`;
    const html = `
      <p>Hi,</p>
      <p>Your order <strong>${orderNumber}</strong> ${STATUS_MESSAGES[status]}.</p>
      <p>Current status: <strong>${status}</strong></p>
      <p>Thank you for shopping with us.</p>
    `;
    await this.sendMail(to, subject, html);
  }
}
