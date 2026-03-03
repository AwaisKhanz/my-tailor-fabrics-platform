import {
  AddonType,
  DesignType,
  Employee,
  FabricSource,
  GarmentType,
} from "@tbms/shared-types";
import { ADDON_TYPE_LABELS } from "@tbms/shared-constants";
import { PlusCircle, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormItemCardProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  garmentTypes: GarmentType[];
  tailors: Employee[];
  designTypeOptions: DesignType[];
  lineTotal: number;
  canRemove: boolean;
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  onRemoveItem: (itemIndex: number) => void;
  onAddAddon: (itemIndex: number) => void;
  onRemoveAddon: (itemIndex: number, addonIndex: number) => void;
}

export function OrderFormItemCard({
  index,
  form,
  garmentTypes,
  tailors,
  designTypeOptions,
  lineTotal,
  canRemove,
  onSelectGarmentType,
  onRemoveItem,
  onAddAddon,
  onRemoveAddon,
}: OrderFormItemCardProps) {
  const watchedAddons = form.watch(`items.${index}.addons`) || [];
  const garmentTypeId = form.watch(`items.${index}.garmentTypeId`);
  const selectedGarment = garmentTypes.find((garment) => garment.id === garmentTypeId);

  return (
    <div className="space-y-5 rounded-xl border border-border/70 bg-background/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" size="xs">
              PIECE {index + 1}
            </Badge>
            {selectedGarment ? (
              <Badge variant="info" size="xs" className="font-bold">
                {selectedGarment.name}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Configure garment, quantity, pricing, and production details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-1.5 text-right">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Piece Total</p>
            <p className="text-sm font-semibold text-foreground">{formatPKR(Math.round(lineTotal * 100))}</p>
          </div>
          <Button
            type="button"
            variant="tableDanger"
            size="iconSm"
            onClick={() => onRemoveItem(index)}
            disabled={!canRemove}
            aria-label={`Remove piece ${index + 1}`}
            title="Remove piece"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-5">
          <FormField
            control={form.control}
            name={`items.${index}.garmentTypeId`}
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Garment Type</FormLabel>
                <Select
                  onValueChange={(value) => onSelectGarmentType(index, value)}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger variant="premium">
                      <SelectValue placeholder="Select garment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {garmentTypes.map((garment) => (
                      <SelectItem key={garment.id} value={garment.id}>
                        {garment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name={`items.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min={1} variant="premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name={`items.${index}.unitPrice`}
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Unit Price (Rs)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} variant="premium" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`items.${index}.designTypeId`}
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel variant="dashboard">Design Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === "NONE" ? undefined : value);
                }}
                value={field.value || "NONE"}
              >
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue placeholder="Standard/No design" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="NONE">Standard / No Design</SelectItem>
                  {designTypeOptions.map((designType) => (
                    <SelectItem key={designType.id} value={designType.id}>
                      {designType.name} (+{formatPKR(designType.defaultPrice)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.employeeId`}
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel variant="dashboard">Assigned Tailor</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "UNASSIGNED" ? undefined : value)}
                value={field.value || "UNASSIGNED"}
              >
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="UNASSIGNED">Not assigned</SelectItem>
                  {tailors.map((tailor) => (
                    <SelectItem key={tailor.id} value={tailor.id}>
                      {tailor.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.fabricSource`}
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel variant="dashboard">Fabric Source</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger variant="premium">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={FabricSource.SHOP}>Shop</SelectItem>
                  <SelectItem value={FabricSource.CUSTOMER}>Customer</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`items.${index}.description`}
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel variant="dashboard">Notes</FormLabel>
              <FormControl>
                <Input
                  variant="premium"
                  placeholder="Collar style, sleeve notes, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label variant="dashboard">Addons & Custom Charges</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 gap-1 text-[10px] font-semibold"
            onClick={() => onAddAddon(index)}
          >
            <PlusCircle className="h-3.5 w-3.5" /> Add Charge
          </Button>
        </div>

        {watchedAddons.length === 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            No addon charges for this piece.
          </p>
        ) : (
          <div className="space-y-2">
            {watchedAddons.map((addon, addonIndex) => (
              <div key={`${index}-${addonIndex}`} className="grid grid-cols-1 items-end gap-2 rounded-md border border-border/60 bg-background p-2 md:grid-cols-12">
                <div className="md:col-span-3">
                  <Select
                    value={addon.type || AddonType.EXTRA}
                    onValueChange={(value) => {
                      form.setValue(
                        `items.${index}.addons.${addonIndex}.type`,
                        value,
                        { shouldDirty: true },
                      );
                    }}
                  >
                    <SelectTrigger variant="premium" className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ADDON_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-6">
                  <Input
                    variant="premium"
                    className="h-8"
                    placeholder="Charge name"
                    {...form.register(`items.${index}.addons.${addonIndex}.name` as const)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    variant="premium"
                    type="number"
                    className="h-8"
                    placeholder="Amount"
                    {...form.register(`items.${index}.addons.${addonIndex}.price` as const, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="flex md:col-span-1 md:justify-end">
                  <Button
                    type="button"
                    variant="tableDanger"
                    size="iconSm"
                    onClick={() => onRemoveAddon(index, addonIndex)}
                    aria-label={`Remove addon ${addonIndex + 1}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
