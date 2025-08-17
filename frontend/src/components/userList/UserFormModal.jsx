import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  getUsers,
  adminCreateUser,
  updateUser,
} from "../../features/auth/authSlice";
import { getProfiles } from "../../features/profiles/profilesSlice";

const UserFormModal = ({ open, onClose, editUser }) => {
  const dispatch = useDispatch();
  const { profiles } = useSelector((s) => s.profiles);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    profileId: "",
  });

  useEffect(() => {
    // English: load profiles for select
    dispatch(getProfiles());
  }, [dispatch]);

  useEffect(() => {
    // English: fill form when editing
    if (editUser) {
      setForm({
        name: editUser.name || "",
        lastName: editUser.lastName || "",
        email: editUser.email || "",
        password: "", // English: keep empty; only used on create
        profileId: editUser.profileId || "",
      });
    } else {
      setForm({
        name: "",
        lastName: "",
        email: "",
        password: "",
        profileId: "",
      });
    }
  }, [editUser]);

  const isEdit = Boolean(editUser?.id);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        // English: do not send email or password here
        await dispatch(
          updateUser({
            userId: editUser.id,
            userData: {
              name: form.name,
              lastName: form.lastName,
              profileId: form.profileId,
            },
          })
        ).unwrap();
        toast.success("Usuario actualizado");
      } else {
        await dispatch(adminCreateUser(form)).unwrap();
        toast.success("Usuario creado");
      }
      // English: refresh lists after mutation
      await Promise.all([dispatch(getUsers()).unwrap()]);
      onClose();
    } catch (e) {
      toast.error(String(e));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{isEdit ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Apellido"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="dense"
          disabled={isEdit} // English: do not allow editing email here
        />
        {!isEdit && (
          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="dense"
          />
        )}
        <TextField
          select
          label="Perfil"
          name="profileId"
          value={form.profileId}
          onChange={handleChange}
          fullWidth
          margin="dense"
        >
          {profiles.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          {isEdit ? "Guardar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserFormModal;
