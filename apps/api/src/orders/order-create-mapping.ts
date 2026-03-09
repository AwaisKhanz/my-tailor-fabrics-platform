import { type Prisma } from '@prisma/client';
import { type ResolvedOrderItemDraft } from './order-item-draft-resolver';
import { toPrismaAddonType, toPrismaFabricSource } from './order-query-resolver';

type OrderItemAddonCreateDraft = {
  type: Parameters<typeof toPrismaAddonType>[0];
  name: string;
  price: number;
  cost?: number;
};

export function toOrderItemAddonCreateData(
  addons: readonly OrderItemAddonCreateDraft[],
): Prisma.OrderItemAddonCreateWithoutOrderItemInput[] {
  return addons.map((addon) => ({
    type: toPrismaAddonType(addon.type),
    name: addon.name,
    price: addon.price,
    cost: addon.cost,
  }));
}

export function toOrderItemCreateData(
  items: readonly ResolvedOrderItemDraft[],
): Prisma.OrderItemCreateWithoutOrderInput[] {
  return items.map((item) => ({
    pieceNo: item.pieceNo,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    description: item.description,
    fabricSource: toPrismaFabricSource(item.fabricSource),
    dueDate: item.dueDate,
    garmentTypeName: item.garmentTypeName,
    garmentType: { connect: { id: item.garmentTypeId } },
    designType: item.designTypeId
      ? { connect: { id: item.designTypeId } }
      : undefined,
    addons: {
      create: toOrderItemAddonCreateData(item.addons),
    },
  }));
}
