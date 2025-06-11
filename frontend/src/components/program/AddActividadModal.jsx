import React, { useState } from "react";
import { Modal, Box, TextField, Button } from "@mui/material";

const AddActividadModal = ({ open, onClose, onSave, parentId }) => {
  const [form, setForm] = useState({
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    responsable: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (form.nombre && form.fechaInicio && form.fechaFin) {
      onSave({ ...form, parentId });
      setForm({ nombre: "", fechaInicio: "", fechaFin: "", responsable: "" });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "white",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          width: 400,
        }}
      >
        <h3>Agregar Actividad</h3>
        <TextField
          fullWidth
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Fecha Inicio"
          type="date"
          name="fechaInicio"
          value={form.fechaInicio}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Fecha Fin"
          type="date"
          name="fechaFin"
          value={form.fechaFin}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          label="Responsable"
          name="responsable"
          value={form.responsable}
          onChange={handleChange}
          margin="normal"
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddActividadModal;
