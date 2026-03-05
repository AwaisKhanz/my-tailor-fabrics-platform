"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryPrimitive = string | number | null | undefined;
type QueryDefaults = Record<string, string>;

interface UseUrlTableStateOptions {
  defaults: QueryDefaults;
  prefix?: string;
}

function toQueryKey(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}_${key}` : key;
}

function createDefaultsSignature(defaults: QueryDefaults): string {
  return JSON.stringify(
    Object.entries(defaults).sort(([left], [right]) =>
      left.localeCompare(right),
    ),
  );
}

export function useUrlTableState({
  defaults,
  prefix,
}: UseUrlTableStateOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paramsSnapshot = searchParams.toString();
  const localParamsSnapshotRef = useRef(paramsSnapshot);
  const [localParamsSnapshot, setLocalParamsSnapshot] = useState(paramsSnapshot);

  useEffect(() => {
    localParamsSnapshotRef.current = paramsSnapshot;
    setLocalParamsSnapshot(paramsSnapshot);
  }, [paramsSnapshot]);

  const defaultsSignature = createDefaultsSignature(defaults);
  const sortedDefaultEntries = useMemo<[string, string][]>(
    () => {
      const parsed = JSON.parse(defaultsSignature);
      if (!Array.isArray(parsed)) {
        return [];
      }

      const entries: [string, string][] = [];

      parsed.forEach((entry) => {
        if (
          Array.isArray(entry) &&
          entry.length === 2 &&
          typeof entry[0] === "string" &&
          typeof entry[1] === "string"
        ) {
          entries.push([entry[0], entry[1]]);
        }
      });

      return entries;
    },
    [defaultsSignature],
  );
  const stableDefaults = useMemo<QueryDefaults>(() => {
    const normalizedDefaults: QueryDefaults = {};
    sortedDefaultEntries.forEach(([key, value]) => {
      normalizedDefaults[key] = value;
    });
    return normalizedDefaults;
  }, [sortedDefaultEntries]);

  const values = useMemo(() => {
    const query = new URLSearchParams(localParamsSnapshot);
    const output: QueryDefaults = {};

    Object.keys(stableDefaults).forEach((key) => {
      const queryKey = toQueryKey(prefix, key);
      const raw = query.get(queryKey);
      output[key] = raw ?? stableDefaults[key];
    });

    return output;
  }, [localParamsSnapshot, prefix, stableDefaults]);

  const setValues = useCallback(
    (updates: Partial<Record<string, QueryPrimitive>>) => {
      const currentQuery = localParamsSnapshotRef.current;
      const nextParams = new URLSearchParams(currentQuery);

      Object.keys(updates).forEach((key) => {
        const queryKey = toQueryKey(prefix, key);
        const nextRaw = updates[key];
        const nextValue = nextRaw === null || nextRaw === undefined ? "" : String(nextRaw);
        const defaultValue = stableDefaults[key];

        if (!nextValue || nextValue === defaultValue) {
          nextParams.delete(queryKey);
          return;
        }

        nextParams.set(queryKey, nextValue);
      });

      const query = nextParams.toString();
      if (query === currentQuery) {
        return;
      }

      localParamsSnapshotRef.current = query;
      setLocalParamsSnapshot(query);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, prefix, router, stableDefaults],
  );

  const resetValues = useCallback(() => {
    setValues(stableDefaults);
  }, [setValues, stableDefaults]);

  const getPositiveInt = useCallback(
    (key: string, fallback: number) => {
      const parsed = Number.parseInt(values[key], 10);
      if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
      }
      return parsed;
    },
    [values],
  );

  return {
    values,
    setValues,
    resetValues,
    getPositiveInt,
  };
}
