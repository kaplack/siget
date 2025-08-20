// pages/UserList.jsx
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MaterialReactTable } from "material-react-table";
import { Button, IconButton, Chip, Tooltip } from "@mui/material";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";
import { FaTrash, FaKey } from "react-icons/fa6";
import { toast } from "react-toastify";

import { getUsers, updateUser, delUser } from "../features/auth/authSlice";
import { getProfiles } from "../features/profiles/profilesSlice";
import UserFormModal from "../components/userList/UserFormModal";
import ChangePasswordModal from "../components/userList/ChangePasswordModal";

import ChangeEmailModal from "../components/userList/ChangeEmailModal";
import { MdAlternateEmail } from "react-icons/md"; // o FaAt

const UserList = () => {
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector((s) => s.auth);
  const { profiles } = useSelector((s) => s.profiles);

  const [openForm, setOpenForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [openPwd, setOpenPwd] = useState(false);
  const [userForPwd, setUserForPwd] = useState(null);
  const [openEmail, setOpenEmail] = useState(false);
  const [userForEmail, setUserForEmail] = useState(null);

  useEffect(() => {
    // English: load users and profiles on mount
    dispatch(getUsers());
    dispatch(getProfiles());
  }, [dispatch]);

  // English: map profileId -> profileName
  const profileMap = useMemo(() => {
    const map = new Map();
    profiles?.forEach((p) => map.set(p.id, p.name));
    return map;
  }, [profiles]);

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Nombre" },
      { accessorKey: "lastName", header: "Apellido" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "profileId",
        header: "Perfil",
        Cell: ({ cell }) => profileMap.get(cell.getValue()) || cell.getValue(),
      },
      {
        accessorKey: "isActive",
        header: "Estado",
        Cell: ({ cell, row }) => (
          <Chip
            label={cell.getValue() ? "Activo" : "Inactivo"}
            color={cell.getValue() ? "success" : "default"}
            onClick={async () => {
              // English: quick toggle isActive via updateUser
              const id = row.original.id;
              const next = !cell.getValue();
              try {
                await dispatch(
                  updateUser({ userId: id, userData: { isActive: next } })
                ).unwrap();
                await dispatch(getUsers()).unwrap();
                toast.success(
                  next ? "Usuario activado" : "Usuario desactivado"
                );
              } catch (e) {
                toast.error(String(e));
              }
            }}
            variant="outlined"
            clickable
            size="small"
          />
        ),
      },
      {
        id: "actions",
        header: "Acciones",
        Cell: ({ row }) => (
          <>
            <Tooltip title="Editar">
              <IconButton
                onClick={() => {
                  setEditingUser(row.original);
                  setOpenForm(true);
                }}
                size="small"
              >
                <FaEdit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cambiar contraseña">
              <IconButton
                onClick={() => {
                  setUserForPwd(row.original);
                  setOpenPwd(true);
                }}
                size="small"
              >
                <FaKey size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cambiar correo">
              <IconButton
                onClick={() => {
                  setUserForEmail(row.original);
                  setOpenEmail(true);
                }}
                size="small"
              >
                <MdAlternateEmail size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                color="error"
                onClick={async () => {
                  if (!window.confirm("¿Desactivar este usuario?")) return;
                  try {
                    await dispatch(delUser(row.original.id)).unwrap();
                    await dispatch(getUsers()).unwrap();
                    toast.success("Usuario eliminado");
                  } catch (e) {
                    toast.error(String(e));
                  }
                }}
                size="small"
              >
                <FaRegTrashAlt size={16} />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [dispatch, profileMap]
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Usuarios</h2>
        <Button
          variant="contained"
          onClick={() => {
            setEditingUser(null);
            setOpenForm(true);
          }}
        >
          Nuevo Usuario
        </Button>
      </div>

      <MaterialReactTable
        columns={columns}
        data={users}
        state={{ isLoading }}
        enableColumnActions={false}
        enableRowActions={false}
      />

      <UserFormModal
        open={openForm}
        onClose={() => setOpenForm(false)}
        editUser={editingUser}
      />

      <ChangePasswordModal
        open={openPwd}
        onClose={() => setOpenPwd(false)}
        user={userForPwd}
      />

      <ChangeEmailModal
        open={openEmail}
        onClose={() => setOpenEmail(false)}
        user={userForEmail}
      />
    </div>
  );
};

export default UserList;
