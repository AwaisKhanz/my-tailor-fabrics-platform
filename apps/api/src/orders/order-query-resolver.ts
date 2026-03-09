import {
  Prisma,
  FabricSource as PrismaFabricSource,
  AddonType as PrismaAddonType,
  OrderStatus as PrismaOrderStatus,
} from '@prisma/client';
import {
  AddonType,
  FabricSource as SharedFabricSource,
  isOrderStatus,
  OrderStatus,
} from '@tbms/shared-types';

export type OrdersFindFilters = {
  status?: string;
  from?: string;
  to?: string;
  employeeId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

const ORDER_STATUS_TO_PRISMA: Record<OrderStatus, PrismaOrderStatus> = {
  [OrderStatus.NEW]: PrismaOrderStatus.NEW,
  [OrderStatus.IN_PROGRESS]: PrismaOrderStatus.IN_PROGRESS,
  [OrderStatus.READY]: PrismaOrderStatus.READY,
  [OrderStatus.OVERDUE]: PrismaOrderStatus.OVERDUE,
  [OrderStatus.DELIVERED]: PrismaOrderStatus.DELIVERED,
  [OrderStatus.COMPLETED]: PrismaOrderStatus.COMPLETED,
  [OrderStatus.CANCELLED]: PrismaOrderStatus.CANCELLED,
};

const ADDON_TYPE_TO_PRISMA: Record<AddonType, PrismaAddonType> = {
  [AddonType.EXTRA]: PrismaAddonType.EXTRA,
  [AddonType.ALTERATION]: PrismaAddonType.ALTERATION,
  [AddonType.DESIGN_CHARGE]: PrismaAddonType.DESIGN_CHARGE,
};

const FABRIC_SOURCE_TO_PRISMA: Record<SharedFabricSource, PrismaFabricSource> =
  {
    [SharedFabricSource.SHOP]: PrismaFabricSource.SHOP,
    [SharedFabricSource.CUSTOMER]: PrismaFabricSource.CUSTOMER,
  };

function parseOrderStatus(rawStatus?: string): OrderStatus | undefined {
  if (!rawStatus) {
    return undefined;
  }

  return isOrderStatus(rawStatus) ? rawStatus : undefined;
}

export function toPrismaOrderStatus(status: OrderStatus): PrismaOrderStatus {
  return ORDER_STATUS_TO_PRISMA[status];
}

export function toPrismaAddonType(type: AddonType): PrismaAddonType {
  return ADDON_TYPE_TO_PRISMA[type];
}

export function toPrismaFabricSource(
  source: SharedFabricSource,
): PrismaFabricSource {
  return FABRIC_SOURCE_TO_PRISMA[source];
}

export function buildOrdersWhereClause(
  branchId: string | null,
  filters: OrdersFindFilters = {},
): Prisma.OrderWhereInput {
  const whereClause: Prisma.OrderWhereInput = { deletedAt: null };

  if (branchId) {
    whereClause.branchId = branchId;
  }

  const parsedStatus = parseOrderStatus(filters.status);
  if (parsedStatus) {
    whereClause.status = toPrismaOrderStatus(parsedStatus);
  }

  if (filters.from || filters.to) {
    whereClause.orderDate = {};
    if (filters.from) whereClause.orderDate.gte = new Date(filters.from);
    if (filters.to) whereClause.orderDate.lte = new Date(filters.to);
  }

  if (filters.employeeId) {
    whereClause.items = {
      some: {
        tasks: {
          some: {
            assignedEmployeeId: filters.employeeId,
            deletedAt: null,
          },
        },
      },
    };
  }

  if (filters.search) {
    const search = filters.search.trim();
    whereClause.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customer: { fullName: { contains: search, mode: 'insensitive' } } },
      { customer: { phone: { contains: search, mode: 'insensitive' } } },
    ];
  }

  return whereClause;
}

export function buildOrdersOrderBy(
  filters: OrdersFindFilters = {},
): Prisma.OrderOrderByWithRelationInput {
  const orderBy: Prisma.OrderOrderByWithRelationInput = {};
  const sortOrder = filters.sortOrder || 'desc';

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'orderNumber':
        orderBy.orderNumber = sortOrder;
        break;
      case 'orderDate':
        orderBy.orderDate = sortOrder;
        break;
      case 'dueDate':
        orderBy.dueDate = sortOrder;
        break;
      case 'totalAmount':
        orderBy.totalAmount = sortOrder;
        break;
      case 'status':
        orderBy.status = sortOrder;
        break;
      case 'customer':
        orderBy.customer = { fullName: sortOrder };
        break;
      default:
        orderBy.orderDate = 'desc';
    }
  } else {
    orderBy.orderDate = 'desc';
  }

  return orderBy;
}
