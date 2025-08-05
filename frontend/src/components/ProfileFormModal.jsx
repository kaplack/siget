import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  createProfile,
  updateProfile,
} from "../features/profiles/profilesSlice";
import { toast } from "react-toastify";

const ProfileFormModal = ({ open, handleClose, editProfile }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editProfile) {
      setName(editProfile.name);
      setDescription(editProfile.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [editProfile]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    const payload = { name: name.trim(), description: description.trim() };
    if (editProfile) {
      dispatch(updateProfile({ id: editProfile.id, profileData: payload }))
        .unwrap()
        .then(() => {
          toast.success("Perfil actualizado");
          handleClose();
        })
        .catch((err) => toast.error(err));
    } else {
      dispatch(createProfile(payload))
        .unwrap()
        .then(() => {
          toast.success("Perfil creado");
          handleClose();
        })
        .catch((err) => toast.error(err));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {editProfile ? "Editar Perfil" : "Nuevo Perfil"}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Descripción"
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleSubmit}>
          {editProfile ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileFormModal;
