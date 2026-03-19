import { DesignType, FabricSource, GarmentType, ShopFabric } from "@tbms/shared-types";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import {
  ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME,
} from "@/components/orders/order-form-item.constants";
import { Textarea } from "@tbms/ui/components/textarea";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import { useWatch, type UseFormReturn } from "react-hook-form";

interface OrderFormItemDetailsProps {
  index: number;
  form: UseFormReturn<OrderFormValues>;
  garmentTypes: GarmentType[];
  shopFabrics: ShopFabric[];
  designTypeOptions: DesignType[];
  onSelectGarmentType: (itemIndex: number, garmentTypeId: string) => void;
  onSelectFabricSource: (itemIndex: number, fabricSource: FabricSource) => void;
  onSelectShopFabric: (itemIndex: number, fabricId: string) => void;
  getItemLineTotal: (item: OrderFormValues["items"][number]) => number;
}

export function OrderFormItemDetails({
  index,
  form,
  garmentTypes,
  shopFabrics,
  designTypeOptions,
  onSelectGarmentType,
  onSelectFabricSource,
  onSelectShopFabric,
  getItemLineTotal,
}: OrderFormItemDetailsProps) {
  const watchedItem =
    useWatch({
      control: form.control,
      name: `items.${index}`,
    }) ?? {};
  const fabricSource = watchedItem.fabricSource ?? FabricSource.CUSTOMER;
  const selectedGarment = garmentTypes.find(
    (garment) => garment.id === watchedItem.garmentTypeId,
  );
  const selectedShopFabric = shopFabrics.find(
    (fabric) => fabric.id === watchedItem.shopFabricId,
  );
  const normalizedItem: OrderFormValues["items"][number] = {
    id: watchedItem.id,
    garmentTypeId: watchedItem.garmentTypeId ?? "",
    quantity: 1,
    unitPrice: Number(watchedItem.unitPrice ?? 0),
    description: watchedItem.description ?? "",
    fabricSource,
    shopFabricId: watchedItem.shopFabricId ?? undefined,
    shopFabricPrice:
      watchedItem.shopFabricPrice === undefined ||
      watchedItem.shopFabricPrice === null
        ? undefined
        : Number(watchedItem.shopFabricPrice),
    customerFabricNote: watchedItem.customerFabricNote ?? "",
    designTypeId: watchedItem.designTypeId ?? undefined,
    addons: (watchedItem.addons ?? []).map((addon) => ({
      type: addon?.type,
      name: addon?.name ?? "",
      price: Number(addon?.price ?? 0),
    })),
  };
  const lineTotal = getItemLineTotal(normalizedItem);
  const tailoringPriceLabel =
    selectedGarment || Number(watchedItem.unitPrice ?? 0) > 0
      ? formatPKR(Math.round(Number(watchedItem.unitPrice ?? 0) * 100))
      : "-";
  const shopFabricPriceLabel =
    selectedShopFabric || normalizedItem.shopFabricPrice !== undefined
      ? formatPKR(
          Math.round(
            Number(
              normalizedItem.shopFabricPrice ??
                (selectedShopFabric ? selectedShopFabric.sellingRate / 100 : 0),
            ) * 100,
          ),
        )
      : "-";
  const chargeTileClassName =
    "rounded-md border bg-muted/20 px-4 py-3 min-h-[104px]";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
      <div className="md:col-span-12 lg:col-span-4">
        <FormField
          control={form.control}
          name={`items.${index}.garmentTypeId`}
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
            <FormItem className="space-y-2">
              <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                Garment Type
              </FormLabel>
              <Select
                onValueChange={(value) => onSelectGarmentType(index, value ?? "")}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-piece-primary-field="true">
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

      <FormField
        control={form.control}
        name={`items.${index}.designTypeId`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="space-y-2 md:col-span-12 lg:col-span-4">
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Design Type
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value === "NONE" ? undefined : value);
              }}
              value={field.value || "NONE"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Standard / No Design" />
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
        name={`items.${index}.fabricSource`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem className="space-y-2 md:col-span-12 lg:col-span-4">
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Fabric Source
            </FormLabel>
            <Select
              onValueChange={(value) =>
                onSelectFabricSource(index, value as FabricSource)
              }
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={FabricSource.CUSTOMER}>Customer Brings Fabric</SelectItem>
                <SelectItem value={FabricSource.SHOP}>Use Shop Fabric</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className={`md:col-span-12 ${fabricSource === FabricSource.SHOP ? "lg:col-span-4" : "lg:col-span-6"}`}>
        <div className={chargeTileClassName}>
          <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Tailoring Charge</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            {tailoringPriceLabel}
          </p>
        </div>
      </div>
      {fabricSource === FabricSource.SHOP ? (
        <div className="md:col-span-12 lg:col-span-4">
          <div className={chargeTileClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Fabric Charge</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {shopFabricPriceLabel}
            </p>
          </div>
        </div>
      ) : null}
      <div className={`md:col-span-12 ${fabricSource === FabricSource.SHOP ? "lg:col-span-4" : "lg:col-span-6"}`}>
        <div className={chargeTileClassName}>
          <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Piece Total</p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {formatPKR(Math.round(lineTotal * 100))}
          </p>
        </div>
      </div>

      {fabricSource === FabricSource.SHOP ? (
        <>
          <div className="md:col-span-12 lg:col-span-8">
            <FormField
              control={form.control}
              name={`items.${index}.shopFabricId`}
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                    Shop Fabric
                  </FormLabel>
                  <Select
                    onValueChange={(value) => onSelectShopFabric(index, value)}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch fabric" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {shopFabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>
                          {fabric.name}
                          {fabric.brand ? ` (${fabric.brand})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-12 lg:col-span-4">
            <div className="space-y-2">
              <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Fabric Details</p>
              <div className="grid min-h-[76px] grid-cols-2 gap-3 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground">
                <div>
                  <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Brand</p>
                  <p className="mt-1 font-medium text-foreground">
                    {selectedShopFabric
                      ? selectedShopFabric.brand || "Not set"
                      : "Select fabric"}
                  </p>
                </div>
                <div>
                  <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Catalog Rate</p>
                  <p className="mt-1 font-medium text-foreground">
                    {selectedShopFabric
                      ? formatPKR(selectedShopFabric.sellingRate)
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="md:col-span-12 lg:col-span-6">
          <FormField
            control={form.control}
            name={`items.${index}.customerFabricNote`}
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem className="space-y-2">
                <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
                  Customer Fabric Note
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="field-sizing-fixed min-h-[96px] resize-y"
                    placeholder="Color, cut, print, tags, or any fabric handling note"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      <FormField
        control={form.control}
        name={`items.${index}.description`}
        render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
          <FormItem
            className={`space-y-2 ${
              fabricSource === FabricSource.CUSTOMER
                ? "md:col-span-12 lg:col-span-6"
                : "md:col-span-12"
            }`}
          >
            <FormLabel className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              Piece Notes
            </FormLabel>
            <FormControl>
              <Textarea
                className="field-sizing-fixed min-h-[112px] resize-y"
                placeholder="Collar style, sleeve notes, lining notes, delivery notes"
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
