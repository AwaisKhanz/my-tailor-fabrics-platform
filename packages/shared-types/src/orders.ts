import { OrderStatus, ItemStatus, DiscountType, TaskStatus, FabricSource, AddonType } from './common';
import { EmployeeLedgerEntry } from './ledger';

export interface OrderItemInput {
  garmentTypeId: string;
  quantity: number;
  employeeId?: string | null;
  description?: string;
  fabricSource?: FabricSource;
  dueDate?: string;
  designTypeId?: string | null;
  addons?: {
    type: string;
    name: string;
    price: number;
    cost?: number;
  }[];
}

export interface CreateOrderInput {
  customerId: string;
  dueDate: string;
  items: OrderItemInput[];
  discountType: DiscountType;
  discountValue: number;
  advancePayment: number;
  notes?: string;
}

export interface UpdateOrderItemInput extends Partial<OrderItemInput> {
  id?: string;
  unitPrice?: number;
  employeeRate?: number;
}

export interface UpdateOrderInput {
  dueDate?: string;
  notes?: string;
  discountType?: DiscountType;
  discountValue?: number;
  items?: UpdateOrderItemInput[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  order?: {
    orderNumber: string;
  };
  garmentTypeId: string;
  garmentTypeName: string;
  quantity: number;
  pieceNo: number;
  unitPrice: number;
  employeeRate: number;
  employeeId?: string | null;
  description?: string;
  fabricSource: FabricSource;
  dueDate?: string;
  completedAt?: string | null;
  status: ItemStatus;
  tasks?: OrderItemTask[];
  addons?: OrderItemAddon[];
  designTypeId?: string | null;
  designType?: DesignType | null;
  employee?: {
    id: string;
    fullName: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  branchId: string;
  customerId: string;
  orderDate: string;
  dueDate: string;
  subtotal: number;
  discountType?: DiscountType | null;
  discountValue: number;
  discountAmount: number;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  status: OrderStatus;
  shareToken?: string | null;
  sharePin?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: import('./customers').Customer;
  items: OrderItem[];
  payments: OrderPayment[];
  statusHistory: OrderStatusHistory[];
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: number;
  paidAt: string;
  note?: string | null;
  ledgerEntries?: import('./ledger').EmployeeLedgerEntry[];
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  actor: string;
  note?: string | null;
  order?: { orderNumber: string };
  createdAt: string;
}

export interface WorkflowStepTemplate {
  id: string;
  garmentTypeId: string;
  stepKey: string;
  stepName: string;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date | string;
}

export interface OrderItemTask {
  id: string;
  orderItemId: string;
  stepTemplateId?: string | null;
  stepKey: string;
  stepName: string;
  sortOrder: number;
  status: TaskStatus;
  assignedEmployeeId?: string | null;
  assignedEmployee?: {
    id: string;
    fullName: string;
  };
  rateCardId?: string | null;
  rateSnapshot?: number | null;
  rateOverride?: number | null;
  item?: {
    garmentTypeName: string;
    order: {
      orderNumber: string;
    };
  };
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
  ledgerEntries?: EmployeeLedgerEntry[];
  designTypeId?: string | null;
  designType?: DesignType | null;
  createdAt: string;
  updatedAt: string;
}

export interface DesignType {
  id: string;
  branchId?: string | null;
  garmentTypeId?: string | null;
  name: string;
  defaultPrice: number;
  defaultRate: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  type: AddonType;
  name: string;
  price: number;
  cost?: number | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemTaskAssignmentEvent {
  id: string;
  taskId: string;
  fromEmployeeId?: string | null;
  toEmployeeId?: string | null;
  changedById?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface DashboardStats {
  revenue: number;
  expenses: number;
  outstandingBalances: number;
  /** @deprecated Use `overdueCount` */
  overdueOrders: number;
  totalOrders: number;
  /** Canonical overdue orders count */
  overdueCount: number;
  newToday: number;
  /** @deprecated Use `outstandingBalances` */
  totalOutstandingBalance: number;
  totalCustomers: number;
  activeEmployees: number;
  recentOrders: Order[];
}
