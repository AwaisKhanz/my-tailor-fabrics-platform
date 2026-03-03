import { Typography } from "@/components/ui/typography";

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
    <Typography as="p" variant="lead" className="-mt-2 mb-4">
      Define a new measurement unit for{" "}
      <span className="font-semibold text-primary">{categoryName}</span>
    </Typography>
  );
}
