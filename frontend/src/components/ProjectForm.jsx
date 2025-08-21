import React, { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import ubigeoData from "../data/ubigeoData.json";
import { useNavigate } from "react-router-dom";
import { FaFolderPlus } from "react-icons/fa";
import {
  createProject,
  updateProject,
} from "../features/projects/projectSlice";
import modeloConvenioData from "../data/modeloConvenioData";
import { addBusinessDays, calendarioConfig } from "../utils/dateUtils";

function ProjectForm({
  modo = "crear",
  initialData = {},
  onSuccess,
  projectId,
}) {
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
    plazo: "",
    plazoSeguimiento: "",
    numeroBeneficiarios: "",
    montoInversion: "",
    estado: "",
    ...initialData,
  });

  const [provincias, setProvincias] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Automatically set inicioConvenio to one business day after firmaConvenio (if not already set)
  useEffect(() => {
    // Only auto-fill if firmaConvenio exists and inicioConvenio is empty or null
    if (form.firmaConvenio && !form.inicioConvenio) {
      // Calculate the next business day after the signature date
      // Normalize to local midnight to avoid UTC offset issues
      const [year, month, day] = form.firmaConvenio.split("-").map(Number);
      const signatureDate = new Date(year, month - 1, day);
      const nextBusinessDate = addBusinessDays(
        signatureDate,
        1,
        calendarioConfig.feriados
      );
      // Format as YYYY-MM-DD
      const isoDate = nextBusinessDate.toISOString().split("T")[0];
      setForm((prev) => ({
        ...prev,
        inicioConvenio: isoDate,
      }));
    }
  }, [form.firmaConvenio, form.inicioConvenio]);

  //Load provincias
  useEffect(() => {
    if (
      form.departamento &&
      form.nivelGobierno !== "regional" &&
      ubigeoData[form.departamento]
    ) {
      const provs = Object.keys(ubigeoData[form.departamento]);
      setProvincias(provs);
    } else {
      setProvincias([]);
    }
  }, [form.departamento, form.nivelGobierno]);

  //Load distritos
  useEffect(() => {
    if (
      form.departamento &&
      form.provincia &&
      form.nivelGobierno === "local" &&
      ubigeoData[form.departamento]?.[form.provincia]
    ) {
      const dists = ubigeoData[form.departamento][form.provincia];
      setDistritos(dists);
    } else {
      setDistritos([]);
    }
  }, [form.departamento, form.provincia, form.nivelGobierno]);

  //ubigeo logic
  useEffect(() => {
    const { nivelGobierno, departamento, provincia, distrito } = form;

    if (!nivelGobierno || !departamento) {
      setForm((prev) => ({ ...prev, ubigeo: "" }));
      return;
    }

    if (nivelGobierno === "regional") {
      const primeraProvincia = ubigeoData[departamento]
        ? Object.values(ubigeoData[departamento])[0]
        : null;
      const primerDistrito = primeraProvincia?.[0];
      if (primerDistrito?.IDDIST) {
        const codigoDep = primerDistrito.IDDIST.slice(0, 2);
        setForm((prev) => ({
          ...prev,
          ubigeo: `${codigoDep}0000`,
          contraparte: `Gobierno Regional de ${departamento}`,
        }));
      }
      return;
    }

    if (nivelGobierno === "local") {
      // Si hay provincia (y no hay distrito todavía), generar XXYY00
      if (provincia && !distrito) {
        const primerDistrito = ubigeoData[departamento]?.[provincia]?.[0];
        if (primerDistrito?.IDDIST) {
          const codigoDep = primerDistrito.IDDIST.slice(0, 2);
          const codigoProv = primerDistrito.IDDIST.slice(2, 4);
          setForm((prev) => ({
            ...prev,
            ubigeo: `${codigoDep}${codigoProv}00`,
            contraparte: `Municipalidad Provincial de ${provincia}`,
          }));
        }
      }

      // Si hay provincia y distrito, usar IDDIST completo
      if (provincia && distrito) {
        const distritoData = ubigeoData[departamento]?.[provincia]?.find(
          (d) => d.NOMBDIST === distrito
        );
        setForm((prev) => ({
          ...prev,
          ubigeo: distritoData?.IDDIST || "",
          contraparte: `Municipalidad Distrital de ${distrito}`,
        }));
      }

      // Si no hay provincia, limpiar
      if (!provincia) {
        setForm((prev) => ({ ...prev, ubigeo: "" }));
      }
    }
  }, [form.nivelGobierno, form.departamento, form.provincia, form.distrito]);

  // Clear provincia and distrito

  useEffect(() => {
    if (form.nivelGobierno === "regional") {
      setForm((prev) => ({
        ...prev,
        provincia: "",
        distrito: "",
      }));
    }
  }, [form.nivelGobierno]);

  useEffect(() => {
    const { ubigeo, contraparte, nombreIdeaProyecto, modeloConvenio } = form;

    if (
      ubigeo &&
      contraparte?.trim() &&
      nombreIdeaProyecto?.trim() &&
      modeloConvenio
    ) {
      const modelo = modeloConvenioData.find(
        (m) => m.modelo === Number(modeloConvenio)
      );

      if (!modelo || !modelo.conv1 || !modelo.conv2) return;

      const contraparteLower = contraparte.toLowerCase();
      const articulo = contraparteLower.includes("municipalidad") ? "la" : "el";

      const nombreGenerado = `${modelo.conv1} ${articulo} ${contraparte} ${modelo.conv2} “${nombreIdeaProyecto}”`;

      setForm((prev) => ({
        ...prev,
        nombreConvenio: nombreGenerado,
      }));
    }
  }, [
    form.ubigeo,
    form.contraparte,
    form.nombreIdeaProyecto,
    form.modeloConvenio,
  ]);

  const modeloSeleccionado = useMemo(() => {
    return modeloConvenioData.find(
      (m) => m.modelo === Number(form.modeloConvenio)
    );
  }, [form.modeloConvenio]);

  const direccionInvalida =
    modeloSeleccionado &&
    form.direccion &&
    !modeloSeleccionado.uso.includes(form.direccion);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

    if (isSubmitting) return;
    if (direccionInvalida) {
      return toast.error(
        "El modelo de convenio no es compatible con la dirección de línea seleccionada"
      );
    }
    setIsSubmitting(true);

    if (
      form.firmaConvenio &&
      form.inicioConvenio &&
      new Date(form.inicioConvenio) < new Date(form.firmaConvenio)
    ) {
      toast.error(
        "La fecha de inicio no puede ser anterior a la firma del convenio"
      );
      setIsSubmitting(false);
      return;
    }

    if (form.numeroBeneficiarios < 0 || form.montoInversion < 0) {
      toast.error("Los valores no pueden ser negativos");
      setIsSubmitting(false);
      return;
    }

    try {
      if (modo === "crear") {
        const user = JSON.parse(localStorage.getItem("user"));
        const data = {
          ...form,
          userId: user.id,
          estado: "borrador",
          firmaConvenio: form.firmaConvenio === "" ? null : form.firmaConvenio,
          inicioConvenio:
            form.inicioConvenio === "" ? null : form.inicioConvenio,
        };
        await dispatch(createProject(data)).unwrap();
        toast.success("Proyecto registrado con éxito");
      } else {
        console.log(form);
        await dispatch(
          updateProject({ id: projectId, updatedData: form })
        ).unwrap();
        toast.success("Proyecto actualizado con éxito");
      }

      navigate("/app/project-list");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Error al guardar el proyecto");
      setIsSubmitting(false);
    }
  };

  const servicios = [
    "SERVICIO DE ATENCIÓN DE SALUD BASICOS",
    "SERVICIO DE AGUA POTABLE RURAL",
    "SERVICIO DE AGUA POTABLE URBANO",
    "SERVICIO DE ALCANTARILLADO U OTRAS FORMAS DE DISPOSICIÓN SANITARIA DE EXCRETAS",
    "SERVICIO DE ALCANTARILLADO",
    "SERVICIO DE TRATAMIENTO DE AGUAS RESIDUALES PARA DISPOSICIÓN FINAL",
    "SERVICIO DE EDUCACIÓN SECUNDARIA",
    "SERVICIO DE EDUCACIÓN PRIMARIA",
    "SERVICIO DE EDUCACIÓN INICIAL",
    "SERVICIO DE PROVISIÓN DE AGUA PARA RIEGO",
    "SERVICIO DE SEGURIDAD CIUDADANA LOCAL",
    "SERVICIO DE PROTECCIÓN EN RIBERAS DE RÍO VULNERABLES ANTE EL PELIGRO",
    "SERVICIO DE PROTECCIÓN EN LA RIBERA DE LAS QUEBRADAS VULNERABLES ANTE EL PELIGRO",
    "SERVICIO DE LIMPIEZA PÚBLICA",
    "SERVICIO DE TRANSITABILIDAD VIAL INTERURBANA",
  ];

  return (
    <div className="container my-4 pt-4 pb-5">
      <h2 className="mb-4 d-flex align-items-center">
        <FaFolderPlus size={50} style={{ marginRight: "1rem" }} />
        {modo === "crear" ? "Crear Convenio" : "Editar Convenio"}
      </h2>
      {modo === "editar" && (
        <p className="text-secondary mb-4">Código: {form?.codigoOedi}</p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6 ">
            <label className="form-label">
              Alias del Convenio (Servicio - Ubicación - Entidad)
            </label>
            {/* <p className="text-secondary">
              <small>Nombre corto del convenio.</small>
            </p> */}
            <input
              name="alias"
              required
              value={form.alias}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Dirección</label>
            <select
              name="direccion"
              required
              value={form.direccion}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Selecciona una dirección --</option>
              <option value="DATEC">DATEC</option>
              <option value="DEP">DEP</option>
              <option value="DET">DET</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Modelo de Convenio</label>
            <select
              name="modeloConvenio"
              required
              value={form.modeloConvenio}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Selecciona un modelo --</option>
              {modeloConvenioData.map((item) => (
                <option key={item.modelo} value={item.modelo}>
                  Modelo {item.modelo} - {item.tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            {modeloSeleccionado ? (
              <>
                <div className="alert alert-info small mt-3">
                  <strong>Descripción:</strong> {modeloSeleccionado.descripcion}
                  <br />
                  <strong>Direcciones aplicables:</strong>{" "}
                  {modeloSeleccionado.uso.join(", ")}
                </div>
                {direccionInvalida && (
                  <div className="alert alert-warning small mt-2">
                    ⚠️ Este modelo no aplica para la dirección seleccionada:{" "}
                    <strong>{form.direccion}</strong>
                  </div>
                )}
              </>
            ) : (
              <div className="alert alert-info small mt-3">
                <p className="text-muted mb-0">
                  Selecciona un modelo para ver la descripción
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="row mb-3 ">
          <div className="col-md-6">
            <label className="form-label">Nivel de Gobierno</label>
            <select
              name="nivelGobierno"
              required
              value={form.nivelGobierno}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- Selecciona nivel --</option>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
            </select>
          </div>
          <div className="col-md-6 h-100 ">
            {form.ubigeo ? (
              <>
                <div className="alert alert-info mb-0 small mt-3 ">
                  <strong>Ubigeo:</strong> {form.ubigeo}
                  <br />
                  <strong>Contraparte:</strong> {form.contraparte}
                </div>
              </>
            ) : (
              <div className="alert alert-info small mt-3">
                <p className="text-muted mb-0">
                  Aquí se mostrará el ubigeo y la contraparte.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="row mb-3 ">
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
          {form.nivelGobierno === "local" && (
            <>
              <div className="col-md-4">
                <label className="form-label">Provincia</label>
                <select
                  name="provincia"
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
            </>
          )}
        </div>

        <div className="row mb-3 ">
          <div className="col-md-6">
            <label className="form-label">CUI</label>
            <input
              name="cui"
              type="number"
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
              value={form.ci}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre de Idea Proyecto</label>
          <input
            name="nombreIdeaProyecto"
            required
            value={form.nombreIdeaProyecto}
            onChange={handleChange}
            className="form-control"
          />
        </div>

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

        <div className="row mb-3 ">
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

        <div className="row mb-3 ">
          <div className="col-md-6">
            <label className="form-label">Firma de Convenio</label>
            <input
              name="firmaConvenio"
              type="date"
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
              value={form.inicioConvenio}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>
        <div className="text-end d-flex justify-content-end gap-2 my-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/app/project-list")}
          >
            {modo === "crear" ? "Convenios Activos" : "Cancelar"}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Guardando...
              </>
            ) : modo === "crear" ? (
              "Crear Convenio"
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProjectForm;
