export function resolveUpdater<T>(
  updater: T | ((previous: T) => T),
  previous: T,
): T {
  if (typeof updater === "function") {
    return (updater as (previous: T) => T)(previous);
  }

  return updater;
}
