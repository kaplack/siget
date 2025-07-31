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
        "comentario",
        "medidasCorrectivas",
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

      // Normalize empty-string to null for date and plazo fields
      if (columnId === "plazo" && (value === "" || value === null)) {
        // User cleared plazo: only clear plazo, no recalc
        setLocalChanges((prev) => ({
          ...prev,
          [rowId]: {
            ...prev[rowId],
            fechaInicio: node.fechaInicio,
            fechaFin: node.fechaFin,
            plazo: null,
          },
        }));
        return;
      }
      if (
        (columnId === "fechaInicio" || columnId === "fechaFin") &&
        (value === "" || value === null)
      ) {
        // User cleared a date: clear that date, keep the other two
        setLocalChanges((prev) => ({
          ...prev,
          [rowId]: {
            ...prev[rowId],
            fechaInicio: columnId === "fechaInicio" ? null : node.fechaInicio,
            fechaFin: columnId === "fechaFin" ? null : node.fechaFin,
            plazo: node.plazo,
          },
        }));
        return;
      }

      // 4. If it's a date or plazo, recalculate the 3rd variable
      // 2 Only recalc if at least two fields are present
      const hasStart = !!node.fechaInicio;
      const hasEnd = !!node.fechaFin;
      const hasPlazo = node.plazo !== null && node.plazo !== undefined;

      // If editing one of the scheduling fields AND there are 2 valid values, recalc:
      if (
        ["fechaInicio", "fechaFin", "plazo"].includes(columnId) &&
        ((hasStart && hasEnd) || (hasStart && hasPlazo) || (hasEnd && hasPlazo))
      ) {
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

      // Record full scheduling fields so render sees recalculations
      setLocalChanges((prev) => ({
        ...prev,
        [rowId]: {
          // keep any otros cambios (avance, comentario, etc.)
          ...prev[rowId],
          // always overwrite the three scheduling fields
          fechaInicio: node.fechaInicio,
          fechaFin: node.fechaFin,
          plazo: node.plazo,
          // además, si editaste otro campo, inclúyelo también
          ...(columnId === "avance" && { avance: value }),
          ...(columnId === "comentario" && { comentario: value }),
          ...(columnId === "sustento" && { sustento: value }),
          ...(columnId === "medidasCorrectivas" && {
            medidasCorrectivas: value,
          }),
        },
      }));
    },
    [data, localChanges, setLocalChanges]
  );

  return handleSaveCell;
}
