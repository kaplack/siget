import dayjs from "dayjs";

export const formatearFechaVisual = (fecha) => {
  return fecha ? dayjs(fecha).format("DD-MM-YYYY") : "";
};

export const parseFechaDMYtoYMD = (fechaDMY) => {
  return dayjs(fechaDMY, "DD-MM-YYYY").format("YYYY-MM-DD");
};
