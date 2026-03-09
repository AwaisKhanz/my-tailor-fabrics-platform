import { type OrderStatus, type Prisma } from '@prisma/client';

interface RecordOrderStatusHistoryParams {
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedById?: string | null;
  note?: string | null;
  actor?: 'USER' | 'SYSTEM';
}

export async function recordOrderStatusHistory(
  tx: Prisma.TransactionClient,
  params: RecordOrderStatusHistoryParams,
) {
  await tx.orderStatusHistory.create({
    data: {
      orderId: params.orderId,
      fromStatus: params.fromStatus,
      toStatus: params.toStatus,
      changedById: params.changedById,
      actor: params.actor ?? 'USER',
      note: params.note ?? null,
    },
  });
}
