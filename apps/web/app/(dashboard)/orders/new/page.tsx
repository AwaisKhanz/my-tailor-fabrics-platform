"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DiscountType, FabricSource, CreateOrderInput } from "@tbms/shared-types";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { typedZodResolver } from "@/lib/utils/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatPKR } from "@/lib/utils";
import {
  Plus,
  Trash2
} from "lucide-react";
import { configApi } from "@/lib/api/config";
import { customerApi } from "@/lib/api/customers";
import { employeesApi } from "@/lib/api/employees";
import { ordersApi } from "@/lib/api/orders";
import { GarmentType } from "@/types/config";
import { Customer } from "@/types/customers";
import { Employee } from "@/types/employees";
import { useToast } from "@/hooks/use-toast";
import { orderSchema, OrderFormValues } from "@/types/orders/schemas"; // Fixed path
import { Separator } from "@/components/ui/separator";
import { designTypesApi } from "@/lib/api/design-types";
import { DesignType, AddonType } from "@tbms/shared-types";
import { ADDON_TYPE_LABELS } from "@tbms/shared-constants";
import { PlusCircle, XCircle } from "lucide-react";


export default function NewOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tailors, setTailors] = useState<Employee[]>([]);
  const [designTypes, setDesignTypes] = useState<DesignType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  const form = useForm<OrderFormValues>({
    resolver: typedZodResolver<OrderFormValues>(orderSchema),
    defaultValues: {
      customerId: "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ garmentTypeId: "", quantity: 1, unitPrice: 0, fabricSource: FabricSource.SHOP }],
      discountType: DiscountType.FIXED,
      discountValue: 0,
      advancePayment: 0,
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("edit");
    if (editId) setEditOrderId(editId);
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [gtRes, cRes, eRes, dtRes] = await Promise.all([
          configApi.getGarmentTypes(),
          customerApi.getCustomers(1, 100),
          employeesApi.getEmployees({ limit: 100 }),
          designTypesApi.findAll()
        ]);
        if (gtRes.success) setGarmentTypes(gtRes.data.data);
        if (cRes.success) setCustomers(cRes.data.data || []);
        if (eRes.success) {
          const empList = eRes.data.data || [];
          setTailors(empList.filter((e: Employee) => 
            e.designation?.toLowerCase().includes('tailor') || 
            e.designation?.toLowerCase().includes('master')
          ));
        }
        if (dtRes.success) setDesignTypes(dtRes.data);

        // Load order IF in edit mode
        if (editOrderId) {
          const orderRes = await ordersApi.getOrder(editOrderId);
          if (orderRes.success) {
            const order = orderRes.data;
            
            // Map items (Paise to Rupees)
            const mappedItems = order.items.map(item => ({
              id: item.id,
              garmentTypeId: item.garmentTypeId,
              quantity: item.quantity,
              unitPrice: item.unitPrice / 100,
              employeeId: item.employeeId || undefined,
              employeeRate: item.employeeRate ? item.employeeRate / 100 : undefined,
              description: item.description || "",
              fabricSource: item.fabricSource || FabricSource.SHOP,
              designTypeId: item.designTypeId || undefined,
              addons: item.addons?.map(a => ({
                type: a.type,
                name: a.name,
                price: a.price / 100
              })) || []
            }));

            form.reset({
              customerId: order.customerId,
              dueDate: new Date(order.dueDate).toISOString().split('T')[0],
              items: mappedItems,
              discountType: order.discountType || DiscountType.FIXED,
              discountValue: order.discountValue / 100,
              advancePayment: order.totalPaid / 100,
              notes: order.notes || "",
            });
          }
        }
      } catch {
        toast({ title: "Error", description: "Failed to load order data" });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [toast, editOrderId, form]);

  const watchedItems = form.watch("items");
  const discountType = form.watch("discountType");
  const discountValue = form.watch("discountValue");
  const advancePayment = form.watch("advancePayment");

  const totals = useMemo(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
      const itemBase = Number(item.unitPrice || 0) * (item.quantity || 0);
      const designType = designTypes.find(dt => dt.id === item.designTypeId);
      const designPrice = ((designType?.defaultPrice || 0) / 100) * (item.quantity || 0);
      const addonsTotal = (item.addons || []).reduce((aAcc, addon) => aAcc + (Number(addon.price) || 0), 0);
      return acc + itemBase + designPrice + (addonsTotal * (item.quantity || 0));
    }, 0);
    
    let discountAmount = 0;
    if (discountType === DiscountType.FIXED) {
      discountAmount = Number(discountValue || 0);
    } else {
      discountAmount = (subtotal * Number(discountValue || 0)) / 100;
    }
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const balanceDue = totalAmount - Number(advancePayment || 0);
    return { subtotal, discountAmount, totalAmount, balanceDue };
  }, [watchedItems, discountType, discountValue, advancePayment, designTypes]);

  async function onSubmit(data: OrderFormValues) {
    setSubmitting(true);
    try {
      // Transform Rupees (UI) to Paise (API)
      const payload = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          unitPrice: Math.round(item.unitPrice * 100),
          employeeRate: item.employeeRate ? Math.round(item.employeeRate * 100) : undefined,
          addons: item.addons?.map(a => ({
            ...a,
            price: Math.round(a.price * 100)
          }))
        })),
        discountValue: data.discountType === DiscountType.FIXED 
          ? Math.round(data.discountValue * 100) 
          : Math.round(data.discountValue * 100),
        advancePayment: Math.round(data.advancePayment * 100),
      };

      if (editOrderId) {
        const response = await ordersApi.updateOrder(editOrderId, payload);
        if (response.success) {
          toast({ title: "Order Updated", description: "The order has been modified successfully." });
          router.push(`/orders/${editOrderId}`);
        }
      } else {
        const response = await ordersApi.createOrder(payload as CreateOrderInput);
        if (response.success) {
          toast({ title: "Order Created", description: `Order #${response.data.orderNumber} successfully created.` });
          router.push(`/orders/${response.data.id}`);
        }
      }
    } catch {
      toast({ title: "Error", description: `Failed to ${editOrderId ? "update" : "create"} order`, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className=" max-w-9xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{editOrderId ? "Edit Order" : "Create New Order"}</h1>
          <Label variant="dashboard" className="text-muted-foreground opacity-100 normal-case font-medium">{editOrderId ? "Modify existing order details and items." : "Book a new order with multiple items and measurements."}</Label>
        </div>
        <Button variant="ghost" onClick={() => router.push(editOrderId ? `/orders/${editOrderId}` : "/orders")}>Cancel</Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Customer Selection */}
              <Card variant="premium">
                <CardHeader>
                  <CardTitle variant="dashboard">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel variant="dashboard">Customer</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger variant="premium">
                              <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.fullName} ({c.phone})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel variant="dashboard">Order Completion Date</FormLabel>
                        <FormControl>
                          <Input variant="premium" type="date" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card variant="premium">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle variant="dashboard">Order Items</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ garmentTypeId: "", quantity: 1, unitPrice: 0, fabricSource: FabricSource.SHOP })}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {fields.map((field, index) => (
                    <div key={field.id} className="relative p-4 border rounded-lg bg-muted/30 space-y-4">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name={`items.${index}.garmentTypeId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel variant="dashboard">Garment Type</FormLabel>
                                <Select 
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    const gt = garmentTypes.find(g => g.id === val);
                                    if (gt) {
                                      form.setValue(`items.${index}.unitPrice`, gt.customerPrice / 100);
                                      form.setValue(`items.${index}.employeeRate`, gt.employeeRate / 100);
                                    }
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger variant="premium">
                                      <SelectValue placeholder="Select Garment" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {garmentTypes.map(g => (
                                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel variant="dashboard">Qty</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel variant="dashboard">Unit Price (Rs)</FormLabel>
                              <FormControl>
                                <Input variant="premium" type="number" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`items.${index}.designTypeId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel variant="dashboard">Design Type</FormLabel>
                              <Select 
                                onValueChange={(val) => {
                                  field.onChange(val === "NONE" ? null : val);
                                }} 
                                value={field.value || "NONE"}
                              >
                                <FormControl>
                                  <SelectTrigger variant="premium">
                                    <SelectValue placeholder="Standard" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="NONE">Standard/No Design</SelectItem>
                                  {designTypes
                                    .filter(dt => !dt.garmentTypeId || dt.garmentTypeId === form.getValues(`items.${index}.garmentTypeId`))
                                    .map(dt => (
                                      <SelectItem key={dt.id} value={dt.id}>{dt.name} (+{formatPKR(dt.defaultPrice)})</SelectItem>
                                    ))
                                  }
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Addons Section */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label variant="dashboard">Addons & Custom Charges</Label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] gap-1"
                            onClick={() => {
                              const currentAddons = form.getValues(`items.${index}.addons`) || [];
                              form.setValue(`items.${index}.addons`, [...currentAddons, { type: AddonType.EXTRA, name: "", price: 0 }]);
                            }}
                          >
                            <PlusCircle className="h-3 w-3" /> Add Charge
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {(form.watch(`items.${index}.addons`) || []).map((addon, aIndex) => (
                            <div key={aIndex} className="flex gap-2 items-end bg-background/50 p-2 rounded border border-dashed">
                              <div className="flex-1">
                                <Select 
                                  value={addon.type} 
                                  onValueChange={(v) => form.setValue(`items.${index}.addons.${aIndex}.type`, v)}
                                >
                                  <SelectTrigger className="h-7" variant="premium">
                                    <SelectValue className="text-[10px] font-bold uppercase tracking-tight" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(ADDON_TYPE_LABELS).map(([k, v]) => (
                                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex-[2]">
                                <Input 
                                  placeholder="Charge name..." 
                                  className="h-7 text-xs" 
                                  {...form.register(`items.${index}.addons.${aIndex}.name` as const)} 
                                />
                              </div>
                              <div className="flex-1">
                                <Input 
                                  type="number" 
                                  placeholder="Price" 
                                  className="h-7 text-xs font-bold" 
                                  {...form.register(`items.${index}.addons.${aIndex}.price` as const, { valueAsNumber: true })} 
                                />
                              </div>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-destructive"
                                onClick={() => {
                                  const current = form.getValues(`items.${index}.addons`) || [];
                                  form.setValue(`items.${index}.addons`, current.filter((_, i) => i !== aIndex));
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <FormField
                            control={form.control}
                            name={`items.${index}.employeeId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel variant="dashboard">Assigned Tailor (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger variant="premium" className="h-8">
                                      <SelectValue placeholder="Select Tailor" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {tailors.map(t => (
                                      <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.fabricSource`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel variant="dashboard">Fabric Source</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger variant="premium" className="h-8">
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={FabricSource.SHOP}>Shop</SelectItem>
                                            <SelectItem value={FabricSource.CUSTOMER}>Customer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`items.${index}.description`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel variant="dashboard">Notes (e.g. Round Neck)</FormLabel>
                                <FormControl>
                                  <Input variant="premium" className="h-8" placeholder="Extra details..." {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card variant="premium" className="sticky top-6">
                <CardHeader>
                  <CardTitle variant="dashboard">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label variant="dashboard">Subtotal</Label>
                      <span className="font-medium">{formatPKR(totals.subtotal * 100)}</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="discountType"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger variant="premium" className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={DiscountType.FIXED}>Flat (Rs)</SelectItem>
                                  <SelectItem value={DiscountType.PERCENTAGE}>Percent (%)</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          control={form.control}
                          name="discountValue"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input variant="premium" type="number" className="h-8 text-xs" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-success">
                      <Label variant="dashboard" className="text-success">Discount</Label>
                      <span className="font-medium">- {formatPKR(totals.discountAmount * 100)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatPKR(totals.totalAmount * 100)}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name="advancePayment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel variant="dashboard">Advance Payment</FormLabel>
                          <FormControl>
                            <Input variant="premium" type="number" className="font-bold text-success" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Label variant="dashboard" className="text-destructive">Balance Due</Label>
                      <span className="text-destructive font-bold">{formatPKR(totals.balanceDue * 100)}</span>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel variant="dashboard">Internal Notes</FormLabel>
                        <FormControl>
                           <Input placeholder="Fragile, Priority etc." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button variant="premium" size="lg" className="w-full" type="submit" disabled={submitting || loading}>
                    {submitting ? "Processing..." : editOrderId ? "Update Order" : "Create Order"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
