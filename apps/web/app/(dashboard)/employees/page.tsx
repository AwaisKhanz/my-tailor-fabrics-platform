"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, ChevronRight } from "lucide-react";
import { employeesApi } from "@/lib/api/employees";
import { Employee } from "@/types/employees";
import { useToast } from "@/hooks/use-toast";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { 
  EMPLOYEE_STATUS_LABELS, 
  EMPLOYEE_STATUS_BADGE 
} from "@tbms/shared-constants";

const PAGE_SIZE = 10;

export default function EmployeesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeesApi.getEmployees({ 
        search: search || undefined, 
        page, 
        limit: PAGE_SIZE 
      });
      if (response.success) {
        setEmployees(response.data.data);
        setTotal(response.data.total);
      }
    } catch {
      toast({ title: "Error", description: "Failed to fetch employees", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [search, page, toast]);

  // Debounce search and fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchEmployees]);

  const handleEdit = (employee: Employee) => {
    router.push(`/employees/${employee.id}`);
  };

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<Employee>[] = [
    {
      header: "Employee",
      cell: (emp) => (
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleEdit(emp)}
        >
          <Avatar className="h-9 w-9 border border-border/50 shadow-sm">
            <AvatarFallback className="bg-primary/5 text-primary font-bold">
              {emp.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
             <span className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors">
               {emp.fullName}
             </span>
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
               {emp.employeeCode}
             </span>
          </div>
        </div>
      ),
    },
    {
      header: "Designation",
      cell: (emp) => (
        <Badge variant="info" className="font-bold tracking-tight px-2 py-0.5 text-[10px]">
          {emp.designation || "Staff"}
        </Badge>
      ),
    },
    {
      header: "Contact",
      cell: (emp) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
             <Phone className="h-3 w-3 text-muted-foreground" /> {emp.phone}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (emp) => (
        <Badge 
          variant={EMPLOYEE_STATUS_BADGE[emp.status] ?? "outline"} 
          className="uppercase font-bold tracking-wider text-[10px]"
        >
          {EMPLOYEE_STATUS_LABELS[emp.status] ?? emp.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (emp) => (
        <div className="flex justify-end pr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(emp);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your workshop staff and tailors.</p>
        </div>
        <Button variant="premium" size="xl" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-border/50 bg-muted/5">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <h2 className="font-bold text-lg text-foreground">Staff Directory</h2>
                 <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-md ring-1 ring-border">
                    {total} results
                 </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative group flex-1 md:w-64">
                  <Input 
                     placeholder="Search employees by name, phone, code..." 
                     variant="premium"
                     className="pl-9 h-10 bg-background"
                     value={search}
                     onChange={(e) => {
                       setSearch(e.target.value);
                       setPage(1);
                     }}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
               </div>
               <Button
                 variant="ghost"
                 size="sm"
                 className="h-10 text-xs font-bold text-muted-foreground hover:text-foreground"
                 onClick={() => {
                   setSearch("");
                   setPage(1);
                 }}
               >
                 Reset
               </Button>
            </div>
          </div>
        </div>

        <div className="p-0">
          <DataTable
            columns={columns}
            data={employees}
            loading={loading}
            page={page}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={setPage}
            itemLabel="employees"
            emptyMessage="No employees found matching your criteria."
            onRowClick={handleEdit}
          />
        </div>
      </div>

      <EmployeeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedEmployee}
        onSuccess={() => {
          fetchEmployees();
        }}
      />
    </div>
  );
}
