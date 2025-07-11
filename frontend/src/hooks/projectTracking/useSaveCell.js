// src/hooks/projectTracking/useSaveCell.js
import { useCallback } from "react";
import { flattenTree, aplicarCambiosLocales } from "../../utils/activityUtils";
import { calcularTerceraVariable } from "../../utils/workingDay";
import { calendarioConfig } from "../../utils/dateUtils";

/**
 * Hook that returns a stable handleSaveCell function.
 *
 * @param {Array}   data            Base tree array from backend
 * @param {Object}  localChanges    Pending edits
 * @param {Function} setLocalChanges Setter for localChanges state
 */
export function useSaveCell({ data, localChanges, setLocalChanges }) {
  const handleSaveCell = useCallback(
    ({ cell, row, value }) => {
      const columnId = cell.column.id;
      const rowId = row.original.id;

      const allowed = [
        "plazo",
        "fechaInicio",
        "fechaFin",
        "avance",
        "sustento",
      ];
      if (!allowed.includes(columnId)) return;

      // Avance validation
      if (columnId === "avance") {
        const n = parseInt(value, 10);
        if (isNaN(n) || n < 0 || n > 100) return;
        value = n;
      }

      // Date validation
      const isDateField = ["fechaInicio", "fechaFin"].includes(columnId);
      if (isDateField && isNaN(new Date(value).getTime())) return;

      // Skip if unchanged
      if (row.original[columnId] === value) return;

      // 1. Merge base tree + pending changes
      const mergedTree = aplicarCambiosLocales(data, localChanges);
      // 2. Flatten that merged tree
      const flatNodes = flattenTree(mergedTree);
      // 3. Find the node to update
      let node = {
        ...flatNodes.find((n) => n.id === rowId),
        [columnId]: value,
      };

      // 4. If it's a date or plazo, recalculate the 3rd variable
      if (["fechaInicio", "fechaFin", "plazo"].includes(columnId)) {
        const result = calcularTerceraVariable(
          {
            fechaInicio: node.fechaInicio,
            fechaFin: node.fechaFin,
            plazo: node.plazo,
          },
          calendarioConfig.feriados,
          columnId
        );
        node = { ...node, ...result };
      }

      // 5. Record only the diff in localChanges
      setLocalChanges((prev) => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          ...(isDateField
            ? {
                fechaInicio: node.fechaInicio,
                fechaFin: node.fechaFin,
                plazo: node.plazo,
              }
            : { [columnId]: value }),
        },
      }));
    },
    [data, localChanges, setLocalChanges]
  );

  return handleSaveCell;
}
