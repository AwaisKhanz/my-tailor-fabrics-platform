import { Text } from "@/components/ui/typography";

interface MeasurementFieldDialogCategoryNoteProps {
  categoryName?: string;
}

export function MeasurementFieldDialogCategoryNote({
  categoryName,
}: MeasurementFieldDialogCategoryNoteProps) {
  if (!categoryName) {
    return null;
  }

  return (
    <Text as="p"  variant="lead" className="-mt-2 mb-4">
      Define a new measurement unit for{" "}
      <span className="font-semibold text-primary">{categoryName}</span>
    </Text>
  );
}
