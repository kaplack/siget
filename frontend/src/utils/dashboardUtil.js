/**
 * Groups an array of agreements by their 'departamento' field
 * and returns an array of objects with department name and count.
 *
 * @param {Array<Object>} agreements - The list of agreement objects.
 * @returns {Array<{ departamento: string, count: number }>}
 */
export const getDepartmentCounts = (agreements) => {
  // Reduce into a map: { departamento: count }
  const map = agreements.reduce((acc, agreement) => {
    // Use a fallback label if departamento is missing/null
    const dept = agreement.departamento ?? "Unknown";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  // Transform map into an array of { departamento, count }
  return Object.entries(map).map(([departamento, count]) => ({
    departamento,
    count,
  }));
};

/**
 * Compute for each (direccion, departamento) the number of
 * colaboracion and delegacion agreements.
 *
 * @param {Array} agreements - List of agreement objects
 * @returns {Array<{ direccion: string, departamento: string, colaboracion: number, delegacion: number }>}
 */
export const getDepartmentAgreeTypeCounts = (agreements) => {
  // Intermediate map keying on "direccion|departamento"
  const map = agreements.reduce((acc, agreement) => {
    // Fallback for missing values
    const dept = agreement.departamento ?? "Unknown";
    const dir = agreement.direccion ?? "Unknown";
    const key = `${dir}|${dept}`;

    // Initialize if not present
    if (!acc[key]) {
      acc[key] = {
        direccion: dir,
        departamento: dept,
        colaboracion: 0,
        delegacion: 0,
      };
    }

    // Count by modeloConvenio
    const m = agreement.modeloConvenio;
    if (m >= 1 && m <= 4) {
      acc[key].delegacion += 1;
    } else if (m >= 5 && m <= 8) {
      acc[key].colaboracion += 1;
    }
    // else: ignore other modelos

    return acc;
  }, {});

  // Transform map into array
  return Object.values(map);
};
