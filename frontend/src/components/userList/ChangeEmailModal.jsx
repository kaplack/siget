import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { toast } from "react-toastify";
import { changeEmail, getUsers } from "../../features/auth/authSlice";

const ChangeEmailModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!user) return null;

  const handleSubmit = async () => {
    // English: basic client-side checks
    if (!email || email.trim().toLowerCase() !== confirm.trim().toLowerCase()) {
      return toast.error("Los correos no coinciden");
    }
    try {
      await dispatch(
        changeEmail({ userId: user.id, newEmail: email.trim().toLowerCase() })
      ).unwrap();
      // English: refresh list if server does not return updated user
      await dispatch(getUsers()).unwrap();
      toast.success("Correo actualizado");
      setEmail("");
      setConfirm("");
      onClose();
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Cambiar correo: {user.email}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Nuevo correo (@oedi.gob.pe)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Confirmar correo"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          fullWidth
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeEmailModal;
