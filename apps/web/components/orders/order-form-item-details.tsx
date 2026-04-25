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
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import { useWatch, type UseFormReturn } from "react-hook-form";

const EMPTY_SHOP_FABRIC_VALUE = "__NO_SHOP_FABRIC__";

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
  const selectedDesignType = designTypeOptions.find(
    (designType) => designType.id === watchedItem.designTypeId,
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
  const addonTotal = (normalizedItem.addons ?? []).reduce(
    (total, addon) => total + Number(addon.price ?? 0),
    0,
  );
  const shopFabricCharge =
    fabricSource === FabricSource.SHOP
      ? Number(
          normalizedItem.shopFabricPrice ??
            (selectedShopFabric ? selectedShopFabric.sellingRate / 100 : 0),
        )
      : 0;
  const tailoringPriceLabel =
    selectedGarment || Number(watchedItem.unitPrice ?? 0) > 0
      ? formatPKR(Math.round(Number(watchedItem.unitPrice ?? 0) * 100))
      : "-";
  const chargeStripCardClassName =
    "flex min-h-[92px] flex-col justify-between rounded-md border bg-muted/15 px-4 py-3";

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

      <div className="md:col-span-12">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_minmax(180px,1.15fr)]">
          <div className={chargeStripCardClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Tailoring Charge</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {tailoringPriceLabel}
            </p>
          </div>
          <div className={chargeStripCardClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Design Charge</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {selectedDesignType ? formatPKR(selectedDesignType.defaultPrice) : formatPKR(0)}
            </p>
          </div>
          <div className={chargeStripCardClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>
              {fabricSource === FabricSource.SHOP ? "Fabric Charge" : "Customer Fabric"}
            </p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {fabricSource === FabricSource.SHOP
                ? formatPKR(Math.round(shopFabricCharge * 100))
                : "No shop charge"}
            </p>
          </div>
          <div className={chargeStripCardClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Add-ons</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {formatPKR(Math.round(addonTotal * 100))}
            </p>
          </div>
          <div className={chargeStripCardClassName}>
            <p className={ORDER_FORM_ITEM_FIELD_LABEL_CLASS_NAME}>Piece Total</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {formatPKR(Math.round(lineTotal * 100))}
            </p>
          </div>
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
                    onValueChange={(value) =>
                      onSelectShopFabric(
                        index,
                        value === EMPTY_SHOP_FABRIC_VALUE ? "" : value,
                      )
                    }
                    value={field.value ?? EMPTY_SHOP_FABRIC_VALUE}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch fabric" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EMPTY_SHOP_FABRIC_VALUE}>
                        Select branch fabric
                      </SelectItem>
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
              <div className="grid min-h-[88px] grid-cols-2 gap-3 rounded-md border border-dashed px-4 py-4 text-sm text-muted-foreground">
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
      ) : null}
    </div>
  );
}
