import { useMemo } from "react";
import { buildTree } from "../../utils/buildTree";
import {
  generarEDTs,
  calcularAvanceRecursivo,
} from "../../utils/activityUtils";
import { recalcularFechasPadres } from "../../utils/workingDay";

/**
 * Build and annotate the WBS tree when rawActivities change.
 */
export function useProjectTree(rawActivities = []) {
  return useMemo(() => {
    const tree = buildTree(rawActivities);
    console.log(tree);
    generarEDTs(tree);
    recalcularFechasPadres(tree);
    tree.forEach(calcularAvanceRecursivo);
    return tree;
  }, [rawActivities]);
}
