"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { configApi } from "@/lib/api/config";
import { customerApi } from "@/lib/api/customers";
import { Customer, CustomerMeasurement } from "@/types/customers";
import { MeasurementCategory } from "@/types/config";
import { Order } from "@tbms/shared-types";
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
import { Label } from "@/components/ui/label";
import { MeasurementForm } from "@/components/customers/MeasurementForm";
import { CustomerDialog } from "@/components/customers/CustomerDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<(Customer & { measurements: CustomerMeasurement[] }) | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMeasurementDialogOpen, setIsMeasurementDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("measurements");
  const [categories, setCategories] = useState<MeasurementCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchCustomerData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [customerRes, configRes, ordersRes] = await Promise.all([
        customerApi.getCustomer(params.id as string),
        configApi.getMeasurementCategories({ limit: 100 }),
        customerApi.getOrders(params.id as string, { limit: 50 })
      ]);
      
      if (customerRes.success) setCustomer(customerRes.data);
      if (configRes.success) setCategories(configRes.data?.data || []);
      if (ordersRes.success) setOrders(ordersRes.data?.data || []);
      
    } catch {
      toast({ title: "Error", description: "Failed to load customer data", variant: "destructive" });
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, toast]);

  useEffect(() => {
    if (params.id) fetchCustomerData();
  }, [params.id, fetchCustomerData]);

  const getMeasurementLabel = (categoryId: string, fieldId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return fieldId.replace(/_/g, ' ');
    const field = cat.fields.find(f => f.id === fieldId);
    return field ? field.label : fieldId.replace(/_/g, ' ');
  };

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
                <Label variant="dashboard" className="mb-1">Total Orders</Label>
                  <div className="flex items-center gap-2">
                     <ShoppingBag className="h-4 w-4 text-primary" />
                     <span className="text-lg font-bold">{customer.stats?.totalOrders || 0}</span>
                  </div>
               </div>
               <div>
                <Label variant="dashboard" className="mb-1">Total Spent</Label>
                  <div className="flex items-center gap-2">
                     <Banknote className="h-4 w-4 text-success" />
                     <span className="text-lg font-bold">{formatPKR(customer.stats?.totalSpent || 0)}</span>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t">
                <Label variant="dashboard" className="mb-1">Status</Label>
               <Badge variant={CUSTOMER_STATUS_BADGE[customer.status] ?? "outline"} size="xs">
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
                          <Label variant="dashboard" className="font-normal opacity-50">Updated: {new Date(m.updatedAt).toLocaleDateString()}</Label>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(m.values).map(([key, val]) => (
                            <div key={key}>
                              <Label variant="dashboard" className="block mb-0.5">{getMeasurementLabel(m.categoryId, key)}</Label>
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
            
            <TabsContent value="orders" className="pt-4 space-y-4">
               {orders.length > 0 ? (
                 <div className="space-y-4">
                   {orders.map(order => (
                     <Card key={order.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push(`/orders/${order.id}`)}>
                       <CardContent className="p-4 flex items-center justify-between">
                         <div>
                           <p className="font-semibold text-sm">{order.orderNumber}</p>
                           <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right">
                           <p className="font-semibold text-sm">{formatPKR(order.totalAmount)}</p>
                           <Badge variant="outline" size="xs">{order.status}</Badge>
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                    <History className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm text-center px-6">Customer order history is currently empty.</p>
                 </div>
               )}
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
        onSuccess={fetchCustomerData} 
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
                    fetchCustomerData();
                  }} 
                />
             </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

