"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { customerApi } from "@/lib/api/customers";
import { Customer, CustomerMeasurement } from "@/types/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Ruler, 
  History, 
  Edit2, 
  ShoppingBag,
  Banknote
} from "lucide-react";
import { formatPKR } from "@/lib/utils";
import { 
  CUSTOMER_STATUS_LABELS, 
  CUSTOMER_STATUS_BADGE 
} from "@tbms/shared-constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MeasurementForm } from "@/components/customers/MeasurementForm";
import { CustomerDialog } from "@/components/customers/CustomerDialog";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<(Customer & { measurements: CustomerMeasurement[] }) | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("measurements");

  const fetchCustomer = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await customerApi.getCustomer(params.id as string);
      if (response.success) {
        setCustomer(response.data);
      }
    } catch {
      toast({ title: "Error", description: "Customer not found", variant: "destructive" });
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (params.id) fetchCustomer();
  }, [params.id, fetchCustomer]);

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-20 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-9xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/customers")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{customer.fullName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
               <Badge variant="outline" className="font-bold tracking-tight">{customer.sizeNumber}</Badge>
               <span>•</span>
               <span>{customer.phone}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
          <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            {customer.whatsapp && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-success" />
                <span>{customer.whatsapp} (WhatsApp)</span>
              </div>
            )}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span>{customer.address}, {customer.city}</span>
            </div>
            
            <div className="pt-4 border-t grid grid-cols-2 gap-4">
               <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Orders</p>
                  <div className="flex items-center gap-2">
                     <ShoppingBag className="h-4 w-4 text-primary" />
                     <span className="text-lg font-bold">{customer.stats?.totalOrders || 0}</span>
                  </div>
               </div>
               <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total Spent</p>
                  <div className="flex items-center gap-2">
                     <Banknote className="h-4 w-4 text-success" />
                     <span className="text-lg font-bold">{formatPKR(customer.stats?.totalSpent || 0)}</span>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t">
               <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</p>
               <Badge variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"} className="uppercase font-bold tracking-wider text-[10px]">
                 {CUSTOMER_STATUS_LABELS[customer.status] ?? customer.status}
               </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList variant="premium">
              <TabsTrigger variant="premium" value="measurements">Measurements</TabsTrigger>
              <TabsTrigger variant="premium" value="orders">Order History</TabsTrigger>
              <TabsTrigger variant="premium" value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="measurements" className="pt-4 space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="text-lg font-semibold">Body Measurements</h3>
                 <Button size="sm" onClick={() => setIsMeasurementDialogOpen(true)}>
                    <Ruler className="h-4 w-4 mr-2" /> Update Measurements
                 </Button>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {customer.measurements?.map((m) => (
                    <Card key={m.id}>
                      <CardHeader className="py-3 bg-muted/30">
                        <CardTitle className="text-sm flex justify-between items-center">
                          {m.category?.name || "Measurement Set"}
                          <span className="text-[10px] font-normal text-muted-foreground">Updated: {new Date(m.updatedAt).toLocaleDateString()}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(m.values).map(([key, val]) => (
                            <div key={key}>
                              <p className="text-[10px] text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</p>
                              <p className="font-semibold text-sm">{val as string}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!customer.measurements || customer.measurements.length === 0) && (
                    <div className="py-12 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                       <Ruler className="h-8 w-8 mb-2 opacity-20" />
                       <p className="text-sm">No measurements recorded yet.</p>
                       <Button variant="link" onClick={() => setIsMeasurementDialogOpen(true)}>Add your first measurement</Button>
                    </div>
                  )}
               </div>
            </TabsContent>
            
            <TabsContent value="orders" className="pt-4">
               <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                  <History className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm italic text-center px-6">Customer order history will automatically populate as orders are booked.</p>
               </div>
            </TabsContent>

            <TabsContent value="notes" className="pt-4">
               <Card>
                 <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {customer.notes || "No special notes or preferences recorded for this customer."}
                    </p>
                 </CardContent>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CustomerDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        customer={customer} 
        onSuccess={fetchCustomer} 
      />

      {/* Measurement Modal */}
      {isMeasurementDialogOpen && (
        <Dialog open={isMeasurementDialogOpen} onOpenChange={setIsMeasurementDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
             <DialogHeader>
                <DialogTitle>Update Body Measurements</DialogTitle>
             </DialogHeader>
             <div className="flex-1 overflow-y-auto p-1">
                <MeasurementForm 
                  customerId={customer.id} 
                  onSuccess={() => {
                    setIsMeasurementDialogOpen(false);
                    fetchCustomer();
                  }} 
                />
             </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Dialog({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 h-8 w-8" 
          onClick={() => onOpenChange(false)}
        >
          ✕
        </Button>
        {children}
      </div>
    </div>
  );
}

function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-bold">{children}</h2>;
}
