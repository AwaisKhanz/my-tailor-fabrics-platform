import { OrderStatus, ItemStatus, DiscountType, TaskStatus } from './common';

export interface OrderItemInput {
  garmentTypeId: string;
  quantity: number;
  employeeId?: string | null;
  description?: string;
  dueDate?: string;
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

export interface OrderItem {
  id: string;
  garmentTypeId: string;
  garmentTypeName: string;
  quantity: number;
  unitPrice: number;
  employeeRate: number;
  employeeId?: string | null;
  description?: string;
  dueDate?: string;
  completedAt?: string | null;
  status: ItemStatus;
  orderId: string;
  tasks?: OrderItemTask[];
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
  customer: {
    fullName: string;
    phone: string;
  };
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
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  note?: string | null;
  actor: string;
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
  createdAt: string;
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
  startedAt?: string | null;
  completedAt?: string | null;
  notes?: string | null;
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
  totalOrders: number;
  overdueCount: number;
  newToday: number;
  totalOutstandingBalance: number;
  totalCustomers: number;
  activeEmployees: number;
  recentOrders: Order[];
}
