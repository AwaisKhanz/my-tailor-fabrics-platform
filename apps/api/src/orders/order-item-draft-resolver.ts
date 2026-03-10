import { BadRequestException } from '@nestjs/common';
import { type Prisma } from '@prisma/client';
import { FabricSource as SharedFabricSource } from '@tbms/shared-types';
import {
  type OrderItemAddonDto,
  type OrderItemDto,
} from './dto/create-order.dto';

export type ResolvedOrderItemDraft = {
  garmentTypeId: string;
  garmentTypeName: string;
  pieceNo: number;
  quantity: number;
  unitPrice: number;
  designPrice: number;
  addonsTotal: number;
  description: string | undefined;
  fabricSource: SharedFabricSource;
  dueDate: Date | null;
  designTypeId: string | null;
  addons: OrderItemAddonDto[];
};

export async function resolveOrderItemDrafts(
  tx: Prisma.TransactionClient,
  items: OrderItemDto[],
): Promise<ResolvedOrderItemDraft[]> {
  const resolvedItems: ResolvedOrderItemDraft[] = [];
  const pieceMap: Record<string, number> = {};

  for (const item of items) {
    const type = await tx.garmentType.findUnique({
      where: { id: item.garmentTypeId },
    });

    if (!type || !type.isActive) {
      throw new BadRequestException(
        `Garment Type ${item.garmentTypeId} not found or inactive`,
      );
    }

    const customerPrice =
      item.unitPrice !== undefined && item.unitPrice !== 0
        ? item.unitPrice
        : type.customerPrice;

    for (let index = 0; index < item.quantity; index += 1) {
      pieceMap[item.garmentTypeId] = (pieceMap[item.garmentTypeId] || 0) + 1;
      const currentPieceNo = pieceMap[item.garmentTypeId];

      const designType = item.designTypeId
        ? await tx.designType.findUnique({
            where: { id: item.designTypeId },
          })
        : null;

      const addonsPrice = (item.addons || []).reduce(
        (sum, addon) => sum + (addon.price || 0),
        0,
      );
      const designPrice = designType?.defaultPrice || 0;

      resolvedItems.push({
        garmentTypeId: type.id,
        garmentTypeName: type.name,
        pieceNo: currentPieceNo,
        quantity: 1,
        unitPrice: customerPrice,
        designPrice,
        addonsTotal: addonsPrice,
        description: item.description,
        fabricSource: item.fabricSource ?? SharedFabricSource.SHOP,
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
        designTypeId: item.designTypeId || null,
        addons: item.addons || [],
      });
    }
  }

  return resolvedItems;
}
