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
import { InfoTile } from "@/components/ui/info-tile";
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

const ADDON_TYPE_OPTIONS: Array<{ type: AddonType; label: string }> = [
  { type: AddonType.EXTRA, label: ADDON_TYPE_LABELS[AddonType.EXTRA] },
  {
    type: AddonType.ALTERATION,
    label: ADDON_TYPE_LABELS[AddonType.ALTERATION],
  },
  {
    type: AddonType.DESIGN_CHARGE,
    label: ADDON_TYPE_LABELS[AddonType.DESIGN_CHARGE],
  },
];

function isAddonType(value: string): value is AddonType {
  return ADDON_TYPE_OPTIONS.some((option) => option.type === value);
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
  const selectedGarment = garmentTypes.find(
    (garment) => garment.id === garmentTypeId,
  );

  return (
    <InfoTile
      padding="none"
      tone={"surface"}
      radius="xl"
      className="space-y-5 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <InfoTile
              tone="elevated"
              padding="none"
              className="text-right !text-xs p-1"
            >
              PIECE {index + 1}
            </InfoTile>
            {selectedGarment ? (
              <Badge variant="info" size="xs" className="font-bold">
                {selectedGarment.name}
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-text-secondary">
            Configure garment, quantity, pricing, and production details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <InfoTile
            tone="elevated"
            padding="none"
            className="text-right p-1 !text-xs "
          >
            <p className=" text-text-primary">
              {formatPKR(Math.round(lineTotal * 100))}
            </p>
          </InfoTile>
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
                    <SelectTrigger variant="default">
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
                  <Input type="number" min={1} variant="default" {...field} />
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
                  <Input type="number" min={0} variant="default" {...field} />
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
                  <SelectTrigger variant="default">
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
                onValueChange={(value) =>
                  field.onChange(value === "UNASSIGNED" ? undefined : value)
                }
                value={field.value || "UNASSIGNED"}
              >
                <FormControl>
                  <SelectTrigger variant="default">
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
                  <SelectTrigger variant="default">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={FabricSource.SHOP}>Shop</SelectItem>
                  <SelectItem value={FabricSource.CUSTOMER}>
                    Customer
                  </SelectItem>
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
                  variant="default"
                  placeholder="Collar style, sleeve notes, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <InfoTile
        tone="elevatedSoft"
        borderStyle="dashed"
        padding="xs"
        className=""
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <Label variant="dashboard">Addons & Custom Charges</Label>
          <Button
            type="button"
            variant="dashboard"
            size="sm"
            className="h-7 gap-1 text-[10px] font-semibold"
            onClick={() => onAddAddon(index)}
          >
            <PlusCircle className="h-3.5 w-3.5" /> Add Charge
          </Button>
        </div>

        {watchedAddons.length === 0 ? (
          <p className="px-1 text-xs text-text-secondary">
            No addon charges for this piece.
          </p>
        ) : (
          <div className="space-y-2">
            {watchedAddons.map((addon, addonIndex) => (
              <InfoTile
                key={`${index}-${addonIndex}`}
                tone="surface"
                padding="none"
                className="grid grid-cols-1 items-end gap-2 rounded-md p-2 md:grid-cols-12"
              >
                <div className="md:col-span-3">
                  <Select
                    value={addon.type || AddonType.EXTRA}
                    onValueChange={(value) => {
                      if (!isAddonType(value)) {
                        return;
                      }
                      form.setValue(`items.${index}.addons.${addonIndex}.type`, value, {
                        shouldDirty: true,
                      });
                    }}
                  >
                    <SelectTrigger variant="default" className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDON_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.type} value={option.type}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-6">
                  <Input
                    variant="default"
                    className="h-8"
                    placeholder="Charge name"
                    {...form.register(
                      `items.${index}.addons.${addonIndex}.name` as const,
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    variant="default"
                    type="number"
                    className="h-8"
                    placeholder="Amount"
                    {...form.register(
                      `items.${index}.addons.${addonIndex}.price` as const,
                      {
                        valueAsNumber: true,
                      },
                    )}
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
              </InfoTile>
            ))}
          </div>
        )}
      </InfoTile>
    </InfoTile>
  );
}
