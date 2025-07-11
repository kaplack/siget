import { useMemo } from "react";
import { aplicarCambiosLocales } from "../../utils/activityUtils";

/**
 * Merge localChanges into the baseTree efficiently.
 */
export function useLocalTree(baseTree = [], localChanges = {}) {
  return useMemo(
    () => aplicarCambiosLocales(baseTree, localChanges),
    [baseTree, localChanges]
  );
}
