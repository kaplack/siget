import dayjs from "dayjs";
import "dayjs/locale/es"; // Import

// Establece el locale a español
dayjs.locale("es");

function formatearFechaLarga(fechaStr) {
  return dayjs(fechaStr).format("D [de] MMMM [de] YYYY");
}

module.exports = {
  formatearFechaLarga,
};
