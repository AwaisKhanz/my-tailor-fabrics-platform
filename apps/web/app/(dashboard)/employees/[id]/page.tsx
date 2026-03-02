"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { employeesApi, EmployeeWithRelations } from "@/lib/api/employees";
import { attendanceApi } from "@/lib/api/attendance";
import { ordersApi } from "@/lib/api/orders";
import { configApi } from "@/lib/api/config";
import { ledgerApi } from "@/lib/api/ledger";
import { 
  OrderItem, 
  AttendanceRecord, 
  OrderItemTask, 
  TaskStatus, 
  SystemSettings, 
  EmployeeLedgerEntry,
  LedgerEntryType 
} from "@tbms/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  FileText, 
  UserPlus, 
  Trash2, 
  Edit2, 
  Banknote, 
  ExternalLink, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccountCreationDialog } from "@/components/employees/AccountCreationDialog";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { formatPKR, formatDate, formatDateTime } from "@/lib/utils";
import { 
  EMPLOYEE_STATUS_LABELS, 
  EMPLOYEE_STATUS_BADGE,
  PAYMENT_TYPE_LABELS,
  TASK_STATUS_LABELS,
  LEDGER_ENTRY_TYPE_LABELS,
  LEDGER_ENTRY_TYPE_BADGE
} from "@tbms/shared-constants";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [stats, setStats] = useState({ totalEarned: 0, totalPaid: 0, currentBalance: 0 });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [tasks, setTasks] = useState<OrderItemTask[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

  // Ledger state
  const [ledgerEntries, setLedgerEntries] = useState<EmployeeLedgerEntry[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerFrom, setLedgerFrom] = useState("");
  const [ledgerTo, setLedgerTo] = useState("");
  const [ledgerType, setLedgerType] = useState<string>("all");
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const LEDGER_LIMIT = 20;

  // New Ledger Entry Dialog State
  const [isLedgerDialogOpen, setIsLedgerDialogOpen] = useState(false);
  const [newEntryType, setNewEntryType] = useState<LedgerEntryType>(LedgerEntryType.ADJUSTMENT);
  const [newEntryAmount, setNewEntryAmount] = useState<string>("");
  const [newEntryNote, setNewEntryNote] = useState("");
  const [isSubmittingLedger, setIsSubmittingLedger] = useState(false);

  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  
  const [docLabel, setDocLabel] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchEmployeeData = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const [empRes, statsRes, itemsRes, attnRes, tasksRes, settingsRes] = await Promise.all([
        employeesApi.getEmployee(params.id as string),
        employeesApi.getStats(params.id as string),
        employeesApi.getItems(params.id as string),
        attendanceApi.getAttendance({ limit: 10 }), // Basic last 10 records
        ordersApi.getTasksByEmployee(params.id as string),
        configApi.getSystemSettings()
      ]);
      
      if (empRes.success) setEmployee(empRes.data);
      if (statsRes.success) setStats({
        totalEarned: statsRes.data.totalEarned ?? 0,
        totalPaid: statsRes.data.totalPaid ?? 0,
        currentBalance: statsRes.data.currentBalance ?? 0
      });
      if (itemsRes.success) setItems(itemsRes.data.data);
      if (settingsRes.success) setSystemSettings(settingsRes.data);
      if (attnRes.success) setAttendance(attnRes.data.data);
      if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
    } catch {
      toast({ title: "Error", description: "Employee data could not be loaded", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [params.id, toast]);

  // Fetch ledger entries separately (lazy loaded on tab switch)
  const fetchLedger = useCallback(async (page = 1) => {
    if (!params.id) return;
    setLedgerLoading(true);
    try {
      const res = await ledgerApi.getStatement(params.id as string, {
        from: ledgerFrom || undefined,
        to: ledgerTo || undefined,
        type: ledgerType === "all" ? undefined : (ledgerType as LedgerEntryType),
        page,
        limit: LEDGER_LIMIT,
      });
      if (res.success) {
        setLedgerEntries(res.data.entries);
        setLedgerTotal(res.data.meta.total);
        setLedgerPage(page);
      }
    } catch {
      toast({ title: "Error", description: "Failed to load ledger", variant: "destructive" });
    } finally {
      setLedgerLoading(false);
    }
  }, [params.id, ledgerFrom, ledgerTo, ledgerType, toast]);

  const submitLedgerEntry = async () => {
    if (!params.id || !newEntryAmount) return;
    setIsSubmittingLedger(true);
    try {
      const amountInRupees = parseFloat(newEntryAmount);
      if (isNaN(amountInRupees)) return;

      const paisas = Math.round(amountInRupees * 100);
      
      // Payout/Advance/Deduction should be negative
      const finalAmount = [LedgerEntryType.PAYOUT, LedgerEntryType.ADVANCE, LedgerEntryType.DEDUCTION].includes(newEntryType)
        ? -Math.abs(paisas)
        : Math.abs(paisas);

      const res = await ledgerApi.createEntry({
        employeeId: params.id as string,
        type: newEntryType,
        amount: finalAmount,
        note: newEntryNote
      });

      if (res.success) {
        toast({ title: "Entry Recorded", description: "Ledger has been updated successfully." });
        setIsLedgerDialogOpen(false);
        setNewEntryAmount("");
        setNewEntryNote("");
        fetchLedger(1);
        fetchEmployeeData(); // Refresh balance cards
      }
    } catch {
      toast({ title: "Error", description: "Failed to create ledger entry", variant: "destructive" });
    } finally {
      setIsSubmittingLedger(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ledger entry? This cannot be undone.")) return;
    try {
      const res = await ledgerApi.deleteEntry(id);
      if (res.success) {
        toast({ title: "Entry Deleted" });
        fetchLedger(ledgerPage);
        fetchEmployeeData(); // Refresh stats
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (params.id) fetchEmployeeData();
  }, [params.id, fetchEmployeeData]);

  const handleUploadDoc = async () => {
    if (!docLabel || !docUrl || !params.id) return;
    setUploading(true);
    try {
        await employeesApi.uploadDocument(params.id as string, {
            label: docLabel,
            fileUrl: docUrl,
            fileType: docUrl.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'
        });
        toast({ title: "Document Uploaded" });
        setIsDocDialogOpen(false);
        setDocLabel("");
        setDocUrl("");
        fetchEmployeeData();
    } catch {
        toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
        setUploading(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 max-w-9xl mx-auto">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );

  if (!employee) return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-xl font-bold">Employee not found</h2>
      <Button variant="link" onClick={() => router.push("/employees")}>Back to list</Button>
    </div>
  );

  const historyColumns: ColumnDef<OrderItem>[] = [
    {
      header: "Order #",
      cell: (item) => <span className="font-bold">{item.order?.orderNumber || "—"}</span>,
    },
    {
      header: "Garment",
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-medium">{item.garmentTypeName}</span>
          <span className="text-[10px] text-muted-foreground">
            {item.completedAt ? `Completed: ${formatDate(item.completedAt)}` : "Pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (item) => <Badge variant="outline" className="scale-90">{item.status}</Badge>,
    },
    {
      header: "Rate",
      align: "right",
      cell: (item) => <span className="text-right font-bold text-primary">{formatPKR(item.employeeRate)}</span>,
    },
    {
      header: "",
      align: "right",
      cell: (item) => (
        <Button variant="ghost" size="icon" onClick={() => router.push(`/orders/${item.orderId}`)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
    {
      header: "Date",
      cell: (rec) => <span className="font-medium">{formatDate(rec.date)}</span>,
    },
    {
      header: "Clock In",
      cell: (rec) => (
        <span className="text-success font-medium text-xs">
          {new Date(rec.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      header: "Clock Out",
      cell: (rec) => (
        <span className="text-destructive font-medium text-xs">
          {rec.clockOut ? new Date(rec.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
        </span>
      ),
    },
    {
      header: "Hours",
      align: "right",
      cell: (rec) => <span className="font-bold">{rec.hoursWorked?.toFixed(1) || '0.0'}h</span>,
    },
  ];

  const handleTaskStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await ordersApi.updateTaskStatus(taskId, status);
      toast({ title: "Status Updated" });
      fetchEmployeeData();
    } catch {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const taskColumns: ColumnDef<OrderItemTask>[] = [
    {
      header: "Order #",
      cell: (task) => <span className="font-bold">{task.item?.order.orderNumber || "—"}</span>,
    },
    {
      header: "Item/Step",
      cell: (task) => (
        <div className="flex flex-col">
          <span className="font-medium">{task.item?.garmentTypeName || "—"}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
            {task.stepName}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (task) => (
        <Select 
            value={task.status} 
            onValueChange={(val) => handleTaskStatusChange(task.id, val as TaskStatus)}
        >
            <SelectTrigger className="h-7 w-[130px] text-[10px] uppercase font-bold">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k} className="text-[10px] uppercase font-bold">{v}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      ),
    },
    {
      header: "Last Update",
      align: "right",
      cell: (task) => (
        <span className="text-[10px] text-muted-foreground">
          {formatDateTime(task.updatedAt)}
        </span>
      ),
    },
  ];

  const ledgerColumns: ColumnDef<EmployeeLedgerEntry>[] = [
    {
      header: "Date",
      cell: (e) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(e.createdAt as string)}
        </span>
      ),
    },
    {
      header: "Type",
      cell: (e) => (
        <Badge variant={LEDGER_ENTRY_TYPE_BADGE[e.type]} className="text-[10px] font-bold uppercase tracking-wider">
          {e.type === LedgerEntryType.EARNING || e.type === LedgerEntryType.SALARY || e.type === LedgerEntryType.ADJUSTMENT
            ? <ArrowUpRight className="h-3 w-3 mr-1 inline" />
            : <ArrowDownLeft className="h-3 w-3 mr-1 inline" />}
          {LEDGER_ENTRY_TYPE_LABELS[e.type]}
        </Badge>
      ),
    },
    {
      header: "Amount",
      align: "right",
      cell: (e) => (
        <span className={`font-black text-sm ${
          e.amount >= 0 ? 'text-ready' : 'text-destructive'
        }`}>
          {e.amount >= 0 ? '+' : ''}{formatPKR(Math.abs(e.amount))}
        </span>
      ),
    },
    {
      header: "Task / Note",
      cell: (e) => (
        <div className="flex flex-col max-w-xs">
          {e.orderItemTask && (
            <span className="text-xs font-semibold">
              {e.orderItemTask.stepName} — {e.orderItemTask.orderItem?.garmentTypeName}
            </span>
          )}
          {e.note && (
            <span className="text-[10px] text-muted-foreground">{e.note}</span>
          )}
        </div>
      ),
    },
    {
      header: "Order #",
      cell: (e) => (
        <span className="text-xs text-muted-foreground">
          {e.orderItemTask?.orderItem?.order?.orderNumber ?? "—"}
        </span>
      ),
    },
    {
      header: "Action",
      align: "right",
      cell: (e) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={() => handleDeleteEntry(e.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/employees")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
             <Avatar className="h-14 w-14 border-2 shadow-sm">
               <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                 {employee.fullName.charAt(0)}
               </AvatarFallback>
             </Avatar>
             <div>
               <h1 className="text-2xl font-bold tracking-tight">{employee.fullName}</h1>
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Badge variant="info" className="font-bold tracking-tight">{employee.employeeCode}</Badge>
                 <span>•</span>
                 <span>{employee.designation}</span>
               </div>
             </div>
          </div>
        </div>
        <div className="flex gap-2">
          {!employee.userAccount && (
            <Button variant="outline" size="sm" onClick={() => setIsAccountDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Provision Account
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border shadow-sm group hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lifetime Earned</p>
                          <h3 className="text-2xl font-black mt-1 text-foreground">{formatPKR(stats.totalEarned)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Banknote className="h-5 w-5 text-primary" />
                      </div>
                  </div>
              </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm group hover:border-success/50 transition-colors">
              <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Paid Out</p>
                          <h3 className="text-2xl font-black mt-1 text-success">{formatPKR(stats.totalPaid)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center shrink-0 group-hover:bg-success/20 transition-colors">
                          <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                  </div>
              </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm group hover:border-warning/50 transition-colors">
              <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                      <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Balance</p>
                          <h3 className="text-2xl font-black mt-1 text-warning">{formatPKR(stats.currentBalance)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0 group-hover:bg-warning/20 transition-colors">
                          <Banknote className="h-5 w-5 text-warning" />
                      </div>
                  </div>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{employee.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{employee.address || "No address provided"}</span>
              </div>
              <Separator />
              <div className="space-y-3">
                 <p className="text-[10px] text-muted-foreground uppercase font-black">Emergency Contact</p>
                 <div>
                    <p className="text-sm font-bold">{employee.emergencyName || "Not set"}</p>
                    <p className="text-xs text-muted-foreground">{employee.emergencyPhone}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-tight">Employment</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Join Date</span>
                <span className="font-medium">{formatDate(employee.dateOfJoining)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pay Model</span>
                <Badge variant="outline" className="text-[10px]">{PAYMENT_TYPE_LABELS[employee.paymentType] ?? employee.paymentType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={EMPLOYEE_STATUS_BADGE[employee.status] ?? "outline"} className="uppercase font-bold tracking-wider text-[10px]">
                  {EMPLOYEE_STATUS_LABELS[employee.status] ?? employee.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue={systemSettings?.useTaskWorkflow ? "tasks" : "history"} className="border rounded-xl bg-card overflow-hidden">
            <TabsList variant="premium" className="px-4 border-b">
              {systemSettings?.useTaskWorkflow && (
                <TabsTrigger variant="premium" value="tasks">
                  Production Tasks
                </TabsTrigger>
              )}
              <TabsTrigger variant="premium" value="history">
                Work History
              </TabsTrigger>
              <TabsTrigger variant="premium" value="ledger" onClick={() => fetchLedger(1)}>
                🧾 Khata Ledger
              </TabsTrigger>
              <TabsTrigger variant="premium" value="attendance">
                Attendance
              </TabsTrigger>
              <TabsTrigger variant="premium" value="documents">
                Documents
              </TabsTrigger>
              <TabsTrigger variant="premium" value="account">
                Account
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="p-0 border-none">
              <DataTable
                columns={taskColumns}
                data={tasks}
                loading={loading}
                emptyMessage="No assigned tasks found."
              />
            </TabsContent>

            <TabsContent value="history" className="p-0 border-none">
              <DataTable
                columns={historyColumns}
                data={items}
                loading={loading}
                emptyMessage="No work items found."
              />
            </TabsContent>

            <TabsContent value="ledger" className="p-4 border-none space-y-4">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Input 
                  type="date" className="h-8 w-36 px-2 text-xs" 
                  value={ledgerFrom} onChange={(e) => setLedgerFrom(e.target.value)}
                />
                <Input 
                  type="date" className="h-8 w-36 px-2 text-xs" 
                  value={ledgerTo} onChange={(e) => setLedgerTo(e.target.value)}
                />
                <Select value={ledgerType} onValueChange={setLedgerType}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(LEDGER_ENTRY_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8" onClick={() => fetchLedger(1)}>Filter</Button>
                
                <div className="flex-1" />
                
                <Button 
                  size="sm" 
                  variant="premium" 
                  className="h-8"
                  onClick={() => setIsLedgerDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Entry
                </Button>
              </div>

              <DataTable<EmployeeLedgerEntry>
                columns={ledgerColumns}
                data={ledgerEntries}
                loading={ledgerLoading}
                emptyMessage="No ledger entries found."
              />

              {ledgerTotal > LEDGER_LIMIT && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted-foreground">
                    Showing {(ledgerPage - 1) * LEDGER_LIMIT + 1}–{Math.min(ledgerPage * LEDGER_LIMIT, ledgerTotal)} of {ledgerTotal}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs"
                      disabled={ledgerPage <= 1}
                      onClick={() => fetchLedger(ledgerPage - 1)}
                    >Prev</Button>
                    <Button
                      size="sm" variant="outline" className="h-7 text-xs"
                      disabled={ledgerPage * LEDGER_LIMIT >= ledgerTotal}
                      onClick={() => fetchLedger(ledgerPage + 1)}
                    >Next</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="attendance" className="p-0 border-none">
              <DataTable
                columns={attendanceColumns}
                data={attendance}
                loading={loading}
                emptyMessage="No attendance records found."
              />
            </TabsContent>
            
            <TabsContent value="documents" className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold">Verification Documents</h3>
                 <Button size="sm" variant="outline" onClick={() => setIsDocDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> Add Document</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {employee.documents?.map((doc) => (
                   <div key={doc.id} className="flex items-center justify-between p-4 border rounded-xl bg-card shadow-sm hover:border-primary/50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="p-2 bg-primary/10 rounded-lg">
                           <FileText className="h-6 w-6 text-primary" />
                       </div>
                       <div>
                         <p className="text-sm font-bold">{doc.label}</p>
                         <p className="text-[10px] text-muted-foreground uppercase font-black">{doc.fileType}</p>
                       </div>
                     </div>
                     <div className="flex gap-2">
                         <Button variant="ghost" size="icon" asChild>
                             <a href={doc.fileUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>
                         </Button>
                     </div>
                   </div>
                 ))}
                 {(!employee.documents || employee.documents.length === 0) && (
                   <div className="col-span-2 py-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                      <FileText className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No documentation uploaded yet.</p>
                   </div>
                 )}
              </div>
            </TabsContent>

            <TabsContent value="account" className="p-6">
              {employee.userAccount ? (
                <Card className="border-success/20 bg-success/10 shadow-none">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-success" /> System Access Enabled
                    </CardTitle>
                    <CardDescription>This employee has an active portal account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Login Email</span>
                      <span className="font-bold tracking-tight">{employee.userAccount.email}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-2 border-b">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={'outline'}>
                          {employee.userAccount.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="p-4 bg-muted rounded-full">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">No Portal Account</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px] mt-1">Provision an account to allow order tracking access.</p>
                  </div>
                  <Button size="lg" className="rounded-full px-8" onClick={() => setIsAccountDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 mr-2" /> Provision Account Now
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Document Upload Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
          <DialogContent className="max-w-sm">
              <DialogHeader>
                  <DialogTitle>Add Document</DialogTitle>
                  <DialogDescription>Attach a file URL for this employee&apos;s records.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                      <Label>Document Label</Label>
                      <Input placeholder="e.g. CNIC Front" value={docLabel} onChange={(e) => setDocLabel(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                      <Label>File URL</Label>
                      <Input placeholder="https://..." value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                  </div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDocDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleUploadDoc} disabled={uploading || !docLabel || !docUrl}>
                      {uploading ? "Saving..." : "Add Document"}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AccountCreationDialog 
        open={isAccountDialogOpen} 
        onOpenChange={setIsAccountDialogOpen} 
        employee={employee}
        onSuccess={fetchEmployeeData}
      />

      <EmployeeDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        initialData={employee}
        onSuccess={fetchEmployeeData}
      />

      {/* Manual Ledger Entry Dialog */}
      <Dialog open={isLedgerDialogOpen} onOpenChange={setIsLedgerDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              Record Ledger Entry
            </DialogTitle>
            <DialogDescription>
              Manually record a transaction for <strong>{employee.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Entry Type</Label>
              <Select value={newEntryType} onValueChange={(v) => setNewEntryType(v as LedgerEntryType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={LedgerEntryType.ADVANCE}>💰 Advance Payment</SelectItem>
                  <SelectItem value={LedgerEntryType.DEDUCTION}>✂️ Deduction (Damage/Other)</SelectItem>
                  <SelectItem value={LedgerEntryType.ADJUSTMENT}>⚖️ General Adjustment</SelectItem>
                  <SelectItem value={LedgerEntryType.SALARY}>💵 Monthly Salary</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground uppercase font-black">
                {[LedgerEntryType.ADVANCE, LedgerEntryType.DEDUCTION].includes(newEntryType) 
                  ? "⚠️ This will decrease employee balance" 
                  : "ℹ️ This will increase employee balance"}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Amount (PKR)</Label>
              <Input 
                type="number" 
                placeholder="e.g. 5000" 
                value={newEntryAmount} 
                onChange={(e) => setNewEntryAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Note / Description</Label>
              <Input 
                placeholder="e.g. Advance for medical bill" 
                value={newEntryNote} 
                onChange={(e) => setNewEntryNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLedgerDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="premium" 
              onClick={submitLedgerEntry} 
              disabled={isSubmittingLedger || !newEntryAmount}
            >
              {isSubmittingLedger ? "Recording..." : "Confirm & Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
