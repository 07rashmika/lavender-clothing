import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { PaymentsService } from '../payments/payments.service';
import { MailService } from '../mail/mail.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
    private readonly paymentsService: PaymentsService,
    private readonly mailService: MailService,
  ) {}

  private generateOrderNumber(): string {
    return `LAV-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}"`,
        );
      }
    }

    const subtotalCents = dto.items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.priceCents * item.quantity;
    }, 0);

    const settings = await this.settingsService.get();
    const taxCents = Math.round((subtotalCents * settings.taxRateBps) / 10000);
    const feeCents =
      dto.payment === PaymentMethod.COD
        ? settings.codFeeCents
        : subtotalCents >= settings.freeShipThresholdCents
          ? 0
          : settings.shippingFeeCents;
    const totalCents = subtotalCents + taxCents + feeCents;

    if (dto.payment === PaymentMethod.CARD) {
      if (!dto.stripePaymentIntentId) {
        throw new BadRequestException('Card payment requires a payment intent');
      }
      const existingOrder = await this.prisma.order.findUnique({
        where: { stripePaymentIntentId: dto.stripePaymentIntentId },
        include: { items: true },
      });
      if (existingOrder) {
        return existingOrder;
      }
      await this.paymentsService.verifyPaymentIntent(
        dto.stripePaymentIntentId,
        totalCents,
      );
    }

    const itemsData: Prisma.OrderItemCreateManyOrderInput[] = dto.items.map(
      (item) => {
        const product = productMap.get(item.productId)!;
        return {
          productId: product.id,
          name: product.name,
          priceCents: product.priceCents,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
        };
      },
    );

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              orderNumber: this.generateOrderNumber(),
              userId,
              subtotalCents,
              taxCents,
              feeCents,
              totalCents,
              payment: dto.payment,
              stripePaymentIntentId: dto.stripePaymentIntentId,
              shippingFirstName: dto.shippingFirstName,
              shippingLastName: dto.shippingLastName,
              shippingAddress: dto.shippingAddress,
              shippingCity: dto.shippingCity,
              shippingState: dto.shippingState,
              shippingZip: dto.shippingZip,
              items: { createMany: { data: itemsData } },
            },
            include: { items: true },
          });

          for (const item of dto.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { decrement: item.quantity } },
            });
          }

          return order;
        });
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
          continue;
        }
        throw err;
      }
    }

    throw new BadRequestException(
      'Could not generate a unique order number, please retry',
    );
  }

  async findAll(query: QueryOrderDto) {
    return this.prisma.order.findMany({
      where: query.status ? { status: query.status } : {},
      include: {
        items: true,
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });

    if (order.user.email) {
      void this.mailService.sendOrderStatusUpdate(
        order.user.email,
        updated.orderNumber,
        updated.status,
      );
    }

    return updated;
  }
}
