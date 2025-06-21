import React, { useState, useEffect } from "react";
import { createProject } from "../features/projects/projectSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ubigeoData from "../data/ubigeoData.json";
import { useNavigate } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";

function NewProject({ onSuccess }) {
  const [form, setForm] = useState({
    nombreConvenio: "",
    contraparte: "",
    departamento: "",
    provincia: "",
    distrito: "",
    ubigeo: "",
    servicioPriorizado: "",
    nombreIdeaProyecto: "",
    cui: "",
    ci: "",
    firmaConvenio: "",
    inicioConvenio: "",
    numeroBeneficiarios: "",
    montoInversion: "",
    estado: "",
  });

  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (form.departamento) {
      const provs = Object.keys(ubigeoData[form.departamento]);
      setProvincias(provs);
      setForm((prev) => ({ ...prev, provincia: "", distrito: "", ubigeo: "" }));
      setDistritos([]);
    }
  }, [form.departamento]);

  useEffect(() => {
    if (form.provincia) {
      const dists = ubigeoData[form.departamento][form.provincia];
      setDistritos(dists);
      setForm((prev) => ({ ...prev, distrito: "", ubigeo: "" }));
    }
  }, [form.provincia]);

  const handleDistritoChange = (e) => {
    const distritoSeleccionado = e.target.value;
    const item = distritos.find((d) => d.NOMBDIST === distritoSeleccionado);
    setForm((prev) => ({
      ...prev,
      distrito: distritoSeleccionado,
      ubigeo: item ? item.IDDIST : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(form.inicioConvenio) < new Date(form.firmaConvenio)) {
      toast.error(
        "La fecha de inicio no puede ser anterior a la firma del convenio"
      );
      return;
    }
    if (form.numeroBeneficiarios < 0 || form.montoInversion < 0) {
      toast.error("Los valores no pueden ser negativos");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    setForm((prev) => ({ ...prev, userId: user.id, estado: "borrador" }));

    try {
      console.log("project form ", form);
      dispatch(createProject(form));
      toast.success("Proyecto registrado con éxito");
      navigate("/app/project-list");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Error al registrar el proyecto");
    }
  };

  const servicios = [
    "SERVICIO DE ATENCIÓN DE SALUD BASICOS",
    "SERVICIO DE AGUA POTABLE RURAL",
    "SERVICIO DE AGUA POTABLE URBANO",
    "SERVICIO DE ALCANTARILLADO U OTRAS FORMAS DE DISPOSICIÓN DE EXCRETAS",
    "SERVICIO DE ALCANTARILLADO",
    "SERVICIO DE EDUCACIÓN SECUNDARIA",
    "SERVICIO DE EDUCACIÓN PRIMARIA",
    "SERVICIO DE EDUCACIÓN INICIAL",
    "SERVICIO DE PROVISIÓN DE AGUA PARA RIEGO",
    "SERVICIO DE SEGURIDAD CIUDADANA LOCAL",
    "SERVICIO DE PROTECCIÓN EN RIBERA DE RIO VULNERABLES ANTE EL PELIGRO",
    "SERVICIO DE PROTECCIÓN EN LA RIBERA DE LAS QUEBRADAS VULNERABLES ANTE EL PELIGRO",
    "SERVICIO DE LIMPIEZA PÚBLICA",
    "SERVICIO DE TRANSITABILIDAD VIAL INTERURBANA",
  ];

  return (
    <div className="container my-4 pt-4 pb-5">
      <h2 className="mb-4 d-flex align-items-center">
        <FaFolderPlus size={50} style={{ marginRight: "1rem" }} />
        Registro de Proyecto
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre del Convenio</label>
          <textarea
            name="nombreConvenio"
            required
            value={form.nombreConvenio}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraparte</label>
          <input
            name="contraparte"
            required
            value={form.contraparte}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Departamento</label>
            <select
              name="departamento"
              required
              value={form.departamento}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Selecciona...</option>
              {Object.keys(ubigeoData).map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Provincia</label>
            <select
              name="provincia"
              required
              value={form.provincia}
              onChange={handleChange}
              disabled={!provincias.length}
              className="form-select"
            >
              <option value="">Selecciona...</option>
              {provincias.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Distrito</label>
            <select
              name="distrito"
              required
              value={form.distrito}
              onChange={handleDistritoChange}
              disabled={!distritos.length}
              className="form-select"
            >
              <option value="">Selecciona...</option>
              {distritos.map((dist) => (
                <option key={dist.IDDIST} value={dist.NOMBDIST}>
                  {dist.NOMBDIST}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Ubigeo</label>
          <input
            name="ubigeo"
            value={form.ubigeo}
            readOnly
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tipo de Servicio</label>
          <select
            name="servicioPriorizado"
            value={form.servicioPriorizado}
            onChange={handleChange}
            className="form-select"
          >
            <option value="">-- Selecciona un servicio --</option>
            {servicios.map((servicio, index) => (
              <option key={index} value={servicio}>
                {servicio}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre de la Idea de Proyecto</label>
          <input
            name="nombreIdeaProyecto"
            required
            value={form.nombreIdeaProyecto}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">CUI</label>
            <input
              name="cui"
              type="number"
              required
              value={form.cui}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">CI</label>
            <input
              name="ci"
              type="number"
              required
              value={form.ci}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Número de Beneficiarios</label>
            <input
              name="numeroBeneficiarios"
              type="number"
              required
              value={form.numeroBeneficiarios}
              onChange={handleChange}
              min="0"
              className="form-control"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Monto de Inversión (S/)</label>
            <input
              name="montoInversion"
              type="number"
              step="0.01"
              required
              value={form.montoInversion}
              onChange={handleChange}
              min="0"
              className="form-control"
            />
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Firma de Convenio</label>
            <input
              name="firmaConvenio"
              type="date"
              required
              value={form.firmaConvenio}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Inicio de Convenio</label>
            <input
              name="inicioConvenio"
              type="date"
              required
              value={form.inicioConvenio}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary">
            Crear Proyecto
          </button>
        </div>
      </form>
    </div>
  );
}

export default NewProject;
