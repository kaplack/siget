import React from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const TestEditComponent = ({ cell }) => {
  return (
    <DatePicker
      value={dayjs()}
      onChange={(val) => console.log("fecha:", val?.format("YYYY-MM-DD"))}
    />
  );
};

const MRTPrueba = () => {
  const table = useMaterialReactTable({
    columns: [
      {
        accessorKey: "fecha",
        header: "Fecha",
        editComponent: TestEditComponent,
      },
    ],
    data: [{ fecha: "2025-06-23" }],
    enableEditing: true,
    editDisplayMode: "cell",
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MaterialReactTable table={table} />
    </LocalizationProvider>
  );
};

export default MRTPrueba;
