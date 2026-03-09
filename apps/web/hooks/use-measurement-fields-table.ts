"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type MeasurementField,
  type MeasurementSection,
} from "@tbms/shared-types";
import { useUrlTableState } from "@/hooks/use-url-table-state";

const PAGE_SIZE = 10;
export const ALL_MEASUREMENT_SECTIONS_FILTER = "all";
export const ALL_MEASUREMENT_SECTIONS_FILTER_LABEL = "All Sections";

const ALL_MEASUREMENT_SECTIONS_OPTION = {
  value: ALL_MEASUREMENT_SECTIONS_FILTER,
  label: ALL_MEASUREMENT_SECTIONS_FILTER_LABEL,
} as const;

interface UseMeasurementFieldsTableParams {
  fields: MeasurementField[];
  sections: MeasurementSection[];
  showArchived: boolean;
  onMoveFieldSection?: (
    field: MeasurementField,
    sectionId: string,
  ) => Promise<void> | void;
}

export function useMeasurementFieldsTable({
  fields,
  sections,
  showArchived,
  onMoveFieldSection,
}: UseMeasurementFieldsTableParams) {
  const [movingFieldId, setMovingFieldId] = useState<string | null>(null);
  const { values, setValues, getPositiveInt } = useUrlTableState({
    prefix: "fields",
    defaults: {
      page: "1",
      limit: String(PAGE_SIZE),
      search: "",
      section: ALL_MEASUREMENT_SECTIONS_FILTER,
    },
  });

  const sectionOptions = useMemo(
    () =>
      [
        ...(showArchived
          ? sections
          : sections.filter((section) => !section.deletedAt)),
      ].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }
        return left.name.localeCompare(right.name);
      }),
    [sections, showArchived],
  );

  const moveSectionOptions = useMemo(
    () => sectionOptions.filter((section) => !section.deletedAt),
    [sectionOptions],
  );

  const sectionFilterOptions = useMemo(
    () => [
      ALL_MEASUREMENT_SECTIONS_OPTION,
      ...sectionOptions.map((section) => ({
        value: section.id,
        label: section.name,
      })),
    ],
    [sectionOptions],
  );

  const search = values.search ?? "";
  const sectionFilter = values.section ?? ALL_MEASUREMENT_SECTIONS_FILTER;
  const page = getPositiveInt("page", 1);
  const pageSize = getPositiveInt("limit", PAGE_SIZE);

  const filteredFields = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const visibleFields = showArchived
      ? fields
      : fields.filter((field) => !field.deletedAt);

    return visibleFields.filter((field) => {
      if (
        sectionFilter !== ALL_MEASUREMENT_SECTIONS_FILTER &&
        field.sectionId !== sectionFilter
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const sectionName = field.section?.name ?? "General";
      const haystack = [field.label, field.unit ?? "", sectionName]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedSearch);
    });
  }, [fields, search, sectionFilter, showArchived]);

  const total = filteredFields.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters =
    search.trim().length > 0 || sectionFilter !== ALL_MEASUREMENT_SECTIONS_FILTER;
  const activeFilterCount =
    (search.trim().length > 0 ? 1 : 0) +
    (sectionFilter !== ALL_MEASUREMENT_SECTIONS_FILTER ? 1 : 0);

  const setPage = useCallback(
    (nextPage: number) => {
      setValues({ page: String(nextPage) });
    },
    [setValues],
  );

  const updateSearch = useCallback(
    (value: string) => {
      setValues({
        search: value,
        page: "1",
      });
    },
    [setValues],
  );

  const updateSectionFilter = useCallback(
    (value: string) => {
      setValues({
        section: value,
        page: "1",
      });
    },
    [setValues],
  );

  const resetFilters = useCallback(() => {
    setValues({
      search: "",
      section: ALL_MEASUREMENT_SECTIONS_FILTER,
      page: "1",
    });
  }, [setValues]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, setPage, totalPages]);

  const pagedFields = useMemo(() => {
    const sortedFields = [...filteredFields].sort((a, b) => {
      const sectionOrderA = a.section?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const sectionOrderB = b.section?.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (sectionOrderA !== sectionOrderB) {
        return sectionOrderA - sectionOrderB;
      }
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.label.localeCompare(b.label);
    });
    const start = (page - 1) * pageSize;
    return sortedFields.slice(start, start + pageSize);
  }, [filteredFields, page, pageSize]);

  const handleMoveFieldSection = useCallback(
    async (field: MeasurementField, sectionId: string) => {
      if (!onMoveFieldSection || sectionId === field.sectionId) {
        return;
      }

      setMovingFieldId(field.id);
      try {
        await onMoveFieldSection(field, sectionId);
      } finally {
        setMovingFieldId((current) => (current === field.id ? null : current));
      }
    },
    [onMoveFieldSection],
  );

  return {
    movingFieldId,
    sectionOptions,
    moveSectionOptions,
    sectionFilterOptions,
    search,
    sectionFilter,
    page,
    pageSize,
    pagedFields,
    total,
    hasActiveFilters,
    activeFilterCount,
    updateSearch,
    updateSectionFilter,
    resetFilters,
    setPage,
    handleMoveFieldSection,
  };
}
