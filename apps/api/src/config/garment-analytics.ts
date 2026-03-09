import { Prisma } from '@prisma/client';
import { FieldType, GarmentTypeWithAnalytics } from '@tbms/shared-types';

const garmentTypeDetailInclude = {
  workflowSteps: {
    where: { deletedAt: null },
    orderBy: { sortOrder: 'asc' as const },
  },
  measurementCategories: {
    where: { deletedAt: null },
    include: {
      sections: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
      },
      fields: {
        where: { deletedAt: null },
        orderBy: { sortOrder: 'asc' as const },
        include: {
          section: true,
        },
      },
    },
  },
  priceLogs: {
    take: 10,
    orderBy: { createdAt: 'desc' as const },
    include: {
      changedBy: { select: { name: true } },
    },
  },
  rateCards: {
    where: { deletedAt: null, effectiveTo: null },
    include: { branch: { select: { name: true, code: true } } },
  },
} satisfies Prisma.GarmentTypeInclude;

export type GarmentTypeDetailRecord = Prisma.GarmentTypeGetPayload<{
  include: typeof garmentTypeDetailInclude;
}>;

type TopTailorCountRow = {
  employeeId: string;
  count: bigint;
};

type TopTailorEmployeeRecord = {
  id: string;
  fullName: string;
};

export function getGarmentTypeDetailInclude(): typeof garmentTypeDetailInclude {
  return garmentTypeDetailInclude;
}

function toSharedFieldType(fieldType: string): FieldType {
  switch (fieldType) {
    case 'NUMBER':
      return FieldType.NUMBER;
    case 'TEXT':
      return FieldType.TEXT;
    case 'DROPDOWN':
      return FieldType.DROPDOWN;
    default:
      return FieldType.NUMBER;
  }
}

export function buildTopTailors(
  rows: TopTailorCountRow[],
  employees: TopTailorEmployeeRecord[],
): Array<{ name: string; count: number }> {
  const employeeNameMap = new Map(
    employees.map((employee) => [employee.id, employee.fullName]),
  );

  return rows.map((entry) => ({
    name: employeeNameMap.get(entry.employeeId) ?? 'Removed Employee',
    count: Number(entry.count),
  }));
}

export function toGarmentTypeWithAnalytics(params: {
  garment: GarmentTypeDetailRecord;
  orderCount: number;
  orderRevenue: number;
  activeOrdersCount: number;
  totalPayoutFromTasks: number;
  topTailors: Array<{ name: string; count: number }>;
}): GarmentTypeWithAnalytics {
  const globalActiveRateTotal = (params.garment.rateCards || []).reduce(
    (sum, rate) => sum + (rate.branchId ? 0 : rate.amount),
    0,
  );

  return {
    ...params.garment,
    marginAmount: params.garment.customerPrice - globalActiveRateTotal,
    marginPercentage:
      params.garment.customerPrice > 0
        ? Math.round(
            ((params.garment.customerPrice - globalActiveRateTotal) /
              params.garment.customerPrice) *
              100,
          )
        : 0,
    priceLogs: (params.garment.priceLogs || []).map((log) => ({
      ...log,
      changedBy: { name: log.changedBy.name },
    })),
    measurementCategories: (params.garment.measurementCategories || []).map(
      (category) => ({
        ...category,
        fields: (category.fields || []).map((field) => ({
          ...field,
          fieldType: toSharedFieldType(field.fieldType),
        })),
        sections: category.sections || [],
      }),
    ),
    workflowSteps: params.garment.workflowSteps || [],
    analytics: {
      totalOrders: params.orderCount,
      activeOrders: params.activeOrdersCount,
      totalRevenue: params.orderRevenue,
      totalPayout: params.totalPayoutFromTasks,
      avgActualPrice:
        params.orderCount > 0
          ? Math.round(params.orderRevenue / params.orderCount)
          : params.garment.customerPrice,
      topTailors: params.topTailors,
    },
  };
}
