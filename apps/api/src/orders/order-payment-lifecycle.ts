import { type Prisma } from '@prisma/client';

interface RecordOrderPaymentParams {
  orderId: string;
  customerId: string;
  amount: number;
  receivedById: string;
  note?: string;
}

interface ReverseRecordedOrderPaymentParams {
  orderId: string;
  customerId: string;
  paymentId: string;
  amount: number;
  reversedById: string;
  note?: string;
  reversedAt: Date;
}

export async function recordOrderPayment(
  tx: Prisma.TransactionClient,
  params: RecordOrderPaymentParams,
) {
  await tx.orderPayment.create({
    data: {
      orderId: params.orderId,
      amount: params.amount,
      receivedById: params.receivedById,
      note: params.note,
    },
  });

  await tx.order.update({
    where: { id: params.orderId },
    data: {
      totalPaid: {
        increment: params.amount,
      },
    },
  });
}

export async function reverseRecordedOrderPayment(
  tx: Prisma.TransactionClient,
  params: ReverseRecordedOrderPaymentParams,
) {
  await tx.orderPayment.update({
    where: { id: params.paymentId },
    data: {
      reversedAt: params.reversedAt,
      reversedById: params.reversedById,
      reversalNote: params.note ?? null,
    },
  });

  await tx.order.update({
    where: { id: params.orderId },
    data: {
      totalPaid: {
        decrement: params.amount,
      },
    },
  });
}
