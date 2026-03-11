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
    <p className="-mt-2 mb-4 text-sm text-muted-foreground">
      Define a new measurement unit for{" "}
      <span className="font-semibold text-primary">{categoryName}</span>
    </p>
  );
}
