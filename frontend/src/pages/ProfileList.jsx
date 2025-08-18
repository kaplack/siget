import React, { useEffect, useMemo, useState } from "react";
import { MaterialReactTable } from "material-react-table";
import { useDispatch, useSelector } from "react-redux";
import { getProfiles, deleteProfile } from "../features/profiles/profilesSlice";
import ProfileFormModal from "../components/ProfileFormModal";
import { Button, IconButton, Tooltip, Box } from "@mui/material";
import { FaEdit, FaRegTrashAlt } from "react-icons/fa";

import { toast } from "react-toastify";

const ProfileList = () => {
  const dispatch = useDispatch();
  const { profiles, isLoading } = useSelector((state) => state.profiles);
  const [openModal, setOpenModal] = useState(false);
  const [editProfile, setEditProfile] = useState(null);

  useEffect(() => {
    dispatch(getProfiles());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este perfil?")) {
      dispatch(deleteProfile(id))
        .unwrap()
        .then(() => toast.success("Perfil eliminado"))
        .catch((err) => toast.error(err));
    }
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Nombre" },
      { accessorKey: "description", header: "Descripción" },
      {
        id: "actions",
        header: "Acciones",
        Cell: ({ row }) => (
          <>
            <Tooltip title="Editar perfil">
              <IconButton
                onClick={() => {
                  setEditProfile(row.original);
                  setOpenModal(true);
                }}
              >
                <FaEdit size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar perfil">
              <IconButton onClick={() => handleDelete(row.original.id)}>
                <FaRegTrashAlt size={16} />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    []
  );

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between mb-3">
        <h2>Perfiles</h2>
        <Button
          variant="contained"
          onClick={() => {
            setEditProfile(null);
            setOpenModal(true);
          }}
        >
          Nuevo Perfil
        </Button>
      </div>
      <MaterialReactTable
        columns={columns}
        data={profiles}
        state={{ isLoading }}
        enableColumnActions={false}
        enableRowActions={false}
      />
      <ProfileFormModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        editProfile={editProfile}
      />
    </div>
  );
};

export default ProfileList;
