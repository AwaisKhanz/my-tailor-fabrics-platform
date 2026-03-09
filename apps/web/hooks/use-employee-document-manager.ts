"use client";

import { useCallback, useState } from "react";
import { employeeDocumentUploadFormSchema } from "@tbms/shared-types";
import type { useToast } from "@/hooks/use-toast";

type ToastFn = ReturnType<typeof useToast>["toast"];

interface UseEmployeeDocumentManagerParams {
  employeeId: string | null;
  fetchEmployeeData: () => Promise<void>;
  toast: ToastFn;
}

export function useEmployeeDocumentManager({
  employeeId,
  fetchEmployeeData,
  toast,
}: UseEmployeeDocumentManagerParams) {
  const [docLabel, setDocLabelState] = useState("");
  const [docUrl, setDocUrlState] = useState("");
  const [documentFieldErrors, setDocumentFieldErrors] = useState<{
    label?: string;
    url?: string;
  }>({});
  const [documentValidationError, setDocumentValidationError] = useState("");
  const [uploadingDocument, setUploadingDocument] = useState(false);

  const setDocLabel = useCallback((value: string) => {
    setDocumentFieldErrors((previous) => ({ ...previous, label: undefined }));
    setDocumentValidationError("");
    setDocLabelState(value);
  }, []);

  const setDocUrl = useCallback((value: string) => {
    setDocumentFieldErrors((previous) => ({ ...previous, url: undefined }));
    setDocumentValidationError("");
    setDocUrlState(value);
  }, []);

  const uploadDocument = useCallback(async () => {
    if (!employeeId) {
      return false;
    }

    const parsedResult = employeeDocumentUploadFormSchema.safeParse({
      label: docLabel,
      url: docUrl,
    });

    if (!parsedResult.success) {
      const flattenedErrors = parsedResult.error.flatten().fieldErrors;
      setDocumentFieldErrors({
        label: flattenedErrors.label?.[0],
        url: flattenedErrors.url?.[0],
      });
      setDocumentValidationError(
        flattenedErrors.label?.[0] ??
          flattenedErrors.url?.[0] ??
          "Fix the highlighted fields and try again.",
      );
      return false;
    }

    setDocumentFieldErrors({});
    setDocumentValidationError("");
    setUploadingDocument(true);

    try {
      const { employeesApi } = await import("@/lib/api/employees");

      await employeesApi.uploadDocument(employeeId, {
        label: parsedResult.data.label,
        fileUrl: parsedResult.data.url,
        fileType: parsedResult.data.url.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      });

      toast({ title: "Document Uploaded" });
      setDocLabelState("");
      setDocUrlState("");
      await fetchEmployeeData();
      return true;
    } catch {
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setUploadingDocument(false);
    }
    return false;
  }, [docLabel, docUrl, employeeId, fetchEmployeeData, toast]);

  return {
    docLabel,
    setDocLabel,
    docUrl,
    setDocUrl,
    documentFieldErrors,
    documentValidationError,
    uploadingDocument,
    uploadDocument,
    clearDocumentForm: () => {
      setDocLabelState("");
      setDocUrlState("");
      setDocumentFieldErrors({});
      setDocumentValidationError("");
    },
  };
}
