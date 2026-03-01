"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { employeesApi, EmployeeWithRelations } from "@/lib/api/employees";
import { attendanceApi } from "@/lib/api/attendance";
import { OrderItem, AttendanceRecord } from "@tbms/shared-types";
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
  TrendingUp,
  Wallet,
  ExternalLink,
  ChevronRight,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AccountCreationDialog } from "@/components/employees/AccountCreationDialog";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { formatPKR, formatDate } from "@/lib/utils";
import { 
  EMPLOYEE_STATUS_LABELS, 
  EMPLOYEE_STATUS_BADGE,
  PAYMENT_TYPE_LABELS 
} from "@tbms/shared-constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DataTable, ColumnDef } from "@/components/ui/data-table";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeWithRelations | null>(null);
  const [stats, setStats] = useState({ totalEarned: 0, totalPaid: 0, balance: 0 });
  const [items, setItems] = useState<(OrderItem & { order: { orderNumber: string } })[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  
  const [docLabel, setDocLabel] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const fetchEmployeeData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, statsRes, itemsRes, attnRes] = await Promise.all([
        employeesApi.getEmployee(params.id as string),
        employeesApi.getStats(params.id as string),
        employeesApi.getItems(params.id as string),
        attendanceApi.getAttendance({ limit: 10 }) // Basic last 10 records
      ]);
      
      if (empRes.success) setEmployee(empRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (itemsRes.success) setItems(itemsRes.data);
      // attendance records are filtered by employeeId on the backend if implemented,
      // here we just take the global list if no filter exists yet (simplified)
      setAttendance(attnRes.data || []);
    } catch {
      toast({ title: "Error", description: "Employee not found", variant: "destructive" });
      router.push("/employees");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (params.id) fetchEmployeeData();
  }, [params.id, fetchEmployeeData]);

  const handleUploadDoc = async () => {
    if (!docLabel || !docUrl) return;
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

  if (!employee) return null;

  const historyColumns: ColumnDef<OrderItem & { order: { orderNumber: string } }>[] = [
    {
      header: "Order #",
      cell: (item) => <span className="font-bold">{item.order.orderNumber}</span>,
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

  return (
    <div className="space-y-6 ">
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
                          <TrendingUp className="h-5 w-5 text-primary" />
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
                          <h3 className="text-2xl font-black mt-1 text-warning">{formatPKR(stats.balance)}</h3>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0 group-hover:bg-warning/20 transition-colors">
                          <Wallet className="h-5 w-5 text-warning" />
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
          <Tabs defaultValue="history" className="border rounded-xl bg-card overflow-hidden">
            <TabsList variant="premium" className="px-4 border-b">
              <TabsTrigger variant="premium" value="history">
                Work History
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
            
            <TabsContent value="history" className="p-0 border-none">
              <DataTable
                columns={historyColumns}
                data={items}
                loading={loading}
                emptyMessage="No work items found."
              />
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
                         <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                             <Trash2 className="h-4 w-4" />
                         </Button>
                     </div>
                   </div>
                 ))}
                 {(!employee.documents || employee.documents.length === 0) && (
                   <div className="col-span-2 py-16 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/50">
                      <FileText className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm font-medium">No documentation uploaded yet.</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload CNIC, Photo, or Contract files.</p>
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
                      <Badge variant={employee.userAccount.isActive ? 'success' : 'destructive'}>
                          {employee.userAccount.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-4">Reset Login Password</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="p-4 bg-muted rounded-full">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground opacity-30" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">No Portal Account</h3>
                    <p className="text-sm text-muted-foreground max-w-[300px] mt-1">Creation of an account allows the tailor to view their own assigned orders and history.</p>
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
                  <DialogDescription>Attach a file for this employee&apos;s records.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                      <Label>Document Label</Label>
                      <Input placeholder="e.g. CNIC Front, Contract" value={docLabel} onChange={(e) => setDocLabel(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                      <Label>File URL (Cloud Storage)</Label>
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
    </div>
  );
}
