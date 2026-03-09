import { type GarmentType as PrismaGarmentType, type Prisma } from '@prisma/client';
import { FabricSource as SharedFabricSource } from '@tbms/shared-types';
import { type OrderItemDto } from './dto/create-order.dto';
import { type UpdateOrderItemDto } from './dto/update-order.dto';
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

export function toSingleOrderItemCreateData(params: {
  orderId: string;
  garmentType: Pick<PrismaGarmentType, 'id' | 'name'>;
  pieceNo: number;
  unitPrice: number;
  item: Pick<
    OrderItemDto,
    'description' | 'fabricSource' | 'dueDate' | 'designTypeId' | 'addons'
  >;
}): Prisma.OrderItemUncheckedCreateInput {
  return {
    orderId: params.orderId,
    garmentTypeId: params.garmentType.id,
    garmentTypeName: params.garmentType.name,
    pieceNo: params.pieceNo,
    quantity: 1,
    unitPrice: params.unitPrice,
    description: params.item.description,
    fabricSource: toPrismaFabricSource(
      params.item.fabricSource ?? SharedFabricSource.SHOP,
    ),
    dueDate: params.item.dueDate ? new Date(params.item.dueDate) : null,
    designTypeId: params.item.designTypeId || null,
    addons: {
      create: toOrderItemAddonCreateData(params.item.addons || []),
    },
  };
}

export function toOrderItemUpdateData(
  item: Pick<
    UpdateOrderItemDto,
    'unitPrice' | 'designTypeId' | 'description' | 'addons'
  >,
): Prisma.OrderItemUpdateInput {
  const data: Prisma.OrderItemUpdateInput = {};

  if (item.unitPrice !== undefined) {
    data.unitPrice = item.unitPrice;
  }

  if (item.designTypeId !== undefined) {
    data.designType = item.designTypeId
      ? { connect: { id: item.designTypeId } }
      : { disconnect: true };
  }

  if (item.description !== undefined) {
    data.description = item.description;
  }

  if (item.addons) {
    data.addons = {
      deleteMany: {},
      create: toOrderItemAddonCreateData(item.addons),
    };
  }

  return data;
}
