-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "WorkflowStepTemplate" (
    "id" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,
    "stepKey" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WorkflowStepTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemTask" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "stepTemplateId" TEXT,
    "stepKey" TEXT NOT NULL,
    "stepName" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "assignedEmployeeId" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrderItemTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemTaskAssignmentEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromEmployeeId" TEXT,
    "toEmployeeId" TEXT,
    "changedById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItemTaskAssignmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkflowStepTemplate_garmentTypeId_sortOrder_idx" ON "WorkflowStepTemplate"("garmentTypeId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowStepTemplate_garmentTypeId_stepKey_key" ON "WorkflowStepTemplate"("garmentTypeId", "stepKey");

-- CreateIndex
CREATE INDEX "OrderItemTask_orderItemId_sortOrder_idx" ON "OrderItemTask"("orderItemId", "sortOrder");

-- CreateIndex
CREATE INDEX "OrderItemTask_assignedEmployeeId_status_idx" ON "OrderItemTask"("assignedEmployeeId", "status");

-- CreateIndex
CREATE INDEX "OrderItemTask_stepKey_idx" ON "OrderItemTask"("stepKey");

-- CreateIndex
CREATE INDEX "OrderItemTaskAssignmentEvent_taskId_idx" ON "OrderItemTaskAssignmentEvent"("taskId");

-- AddForeignKey
ALTER TABLE "WorkflowStepTemplate" ADD CONSTRAINT "WorkflowStepTemplate_garmentTypeId_fkey" FOREIGN KEY ("garmentTypeId") REFERENCES "GarmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTask" ADD CONSTRAINT "OrderItemTask_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTask" ADD CONSTRAINT "OrderItemTask_stepTemplateId_fkey" FOREIGN KEY ("stepTemplateId") REFERENCES "WorkflowStepTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTask" ADD CONSTRAINT "OrderItemTask_assignedEmployeeId_fkey" FOREIGN KEY ("assignedEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTaskAssignmentEvent" ADD CONSTRAINT "OrderItemTaskAssignmentEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OrderItemTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTaskAssignmentEvent" ADD CONSTRAINT "OrderItemTaskAssignmentEvent_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
