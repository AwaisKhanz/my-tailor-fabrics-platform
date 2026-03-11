import { OrderStatus } from "@tbms/shared-types";
import { type Step } from "@tbms/ui/components/progress-steps";

const STANDARD_FLOW: Array<{ label: string; status: OrderStatus }> = [
  { label: "New", status: OrderStatus.NEW },
  { label: "In Progress", status: OrderStatus.IN_PROGRESS },
  { label: "Ready", status: OrderStatus.READY },
  { label: "Delivered", status: OrderStatus.DELIVERED },
  { label: "Completed", status: OrderStatus.COMPLETED },
];

function normalizeOrderProgressStatus(status: OrderStatus): OrderStatus {
  if (status === OrderStatus.OVERDUE) {
    return OrderStatus.IN_PROGRESS;
  }

  return status;
}

export function buildOrderProgressSteps(status: OrderStatus): Step[] {
  if (status === OrderStatus.CANCELLED) {
    return [
      { label: "New", status: "completed" },
      { label: "Cancelled", status: "current" },
    ];
  }

  const normalizedStatus = normalizeOrderProgressStatus(status);
  const currentIndex = STANDARD_FLOW.findIndex(
    (step) => step.status === normalizedStatus,
  );

  if (currentIndex < 0) {
    return STANDARD_FLOW.map((step) => ({
      label: step.label,
      status: "pending",
    }));
  }

  if (normalizedStatus === OrderStatus.COMPLETED) {
    return STANDARD_FLOW.map((step) => ({
      label: step.label,
      status: "completed",
    }));
  }

  return STANDARD_FLOW.map((step, index) => {
    if (index < currentIndex) {
      return { label: step.label, status: "completed" as const };
    }

    if (index === currentIndex) {
      return { label: step.label, status: "current" as const };
    }

    return { label: step.label, status: "pending" as const };
  });
}

