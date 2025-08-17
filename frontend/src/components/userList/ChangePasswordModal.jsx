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
import { changePassword } from "../../features/auth/authSlice";

const ChangePasswordModal = ({ open, onClose, user }) => {
  const dispatch = useDispatch();
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!user) return null;

  const handleSubmit = async () => {
    // English: simple client-side check
    if (!pwd || pwd !== confirm) {
      return toast.error("Las contraseñas no coinciden");
    }
    try {
      await dispatch(
        changePassword({ userId: user.id, passwordData: pwd })
      ).unwrap();
      toast.success("Contraseña actualizada");
      setPwd("");
      setConfirm("");
      onClose();
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Cambiar contraseña: {user.email}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Nueva contraseña"
          type="password"
          fullWidth
          margin="dense"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
        />
        <TextField
          label="Confirmar"
          type="password"
          fullWidth
          margin="dense"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
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

export default ChangePasswordModal;
