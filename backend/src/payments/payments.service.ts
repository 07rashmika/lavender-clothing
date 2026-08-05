import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  private getStripe(): Stripe {
    if (!this.stripe) {
      const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
      if (!secretKey) {
        throw new BadRequestException(
          'Card payments are not configured on this server yet',
        );
      }
      this.stripe = new Stripe(secretKey);
    }
    return this.stripe;
  }

  async computeCartTotalCents(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true, customization: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const subtotalCents = cartItems.reduce(
      (sum, item) =>
        sum +
        (item.product?.priceCents ??
          item.customization?.estimatedPriceCents ??
          4500) *
          item.quantity,
      0,
    );

    const settings = await this.settingsService.get();
    const taxCents = Math.round((subtotalCents * settings.taxRateBps) / 10000);
    const feeCents =
      subtotalCents >= settings.freeShipThresholdCents
        ? 0
        : settings.shippingFeeCents;

    return subtotalCents + taxCents + feeCents;
  }

  async createIntentForCart(userId: string) {
    const amountCents = await this.computeCartTotalCents(userId);

    const intent = await this.getStripe().paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: { userId },
    });

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amountCents,
    };
  }

  async verifyPaymentIntent(
    paymentIntentId: string,
    expectedAmountCents: number,
  ) {
    let intent: Stripe.PaymentIntent;
    try {
      intent = await this.getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch {
      throw new BadRequestException('Invalid payment reference');
    }
    if (intent.status !== 'succeeded') {
      throw new BadRequestException('Payment has not been completed');
    }
    if (intent.amount !== expectedAmountCents) {
      throw new BadRequestException(
        'Payment amount does not match order total',
      );
    }
    return intent;
  }
}
