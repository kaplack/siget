import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProject } from "../features/projects/projectSlice";
import ProjectForm from "../components/ProjectForm";

function EditProject() {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { project, isLoading, isError, message } = useSelector(
    (state) => state.project // <-- nombre del slice
  );

  useEffect(() => {
    if (id) {
      dispatch(getProject(id));
    }
  }, [dispatch, id]);

  if (isLoading) {
    return <div className="container mt-5">Cargando proyecto...</div>;
  }

  if (isError || !project) {
    return (
      <div className="container mt-5 text-danger">
        Error al cargar el proyecto: {message || "No encontrado"}
      </div>
    );
  }

  return (
    <ProjectForm modo="editar" initialData={project} projectId={project.id} />
  );
}

export default EditProject;
