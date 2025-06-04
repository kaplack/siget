import React, { useState, useEffect } from "react";
import { buildTree } from "../utils/buildTree";
// import { getActividades } from "../api/programacionApi"; // API que trae el listado plano
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Componente recursivo para renderizar el árbol
const ActividadRow = ({ actividad, nivel = 0, onAddChild }) => {
  const padding = nivel * 20;

  return (
    <>
      <tr>
        <td style={{ paddingLeft: `${padding}px` }}>{actividad.nombre}</td>
        <td>{actividad.fechaInicio}</td>
        <td>{actividad.fechaFin}</td>
        <td>{actividad.responsable}</td>
        <td>
          <button onClick={() => onAddChild(actividad.id)}>
            + Subactividad
          </button>
        </td>
      </tr>

      {actividad.children.map((child) => (
        <ActividadRow
          key={child.id}
          actividad={child}
          nivel={nivel + 1}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
};

const Programacion = ({ projectId }) => {
  const [actividades, setActividades] = useState([]);
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      //   const data = await getActividades(projectId);
      const data = [
        {
          id: 1,
          parentId: null,
          nombre: "Formulación",
          fechaInicio: "2025-06-01",
          fechaFin: "2025-06-10",
          responsable: "Juan Pérez",
          observaciones: "Inicio del estudio",
        },
        {
          id: 2,
          parentId: 1,
          nombre: "Revisión técnica",
          fechaInicio: "2025-06-02",
          fechaFin: "2025-06-05",
          responsable: "Ana Gómez",
          observaciones: "Revisión de documentos",
        },
        {
          id: 3,
          parentId: 2,
          nombre: "Validación presupuesto",
          fechaInicio: "2025-06-06",
          fechaFin: "2025-06-08",
          responsable: "Carlos Díaz",
          observaciones: "Validación financiera",
        },
        {
          id: 4,
          parentId: null,
          nombre: "Ejecución",
          fechaInicio: "2025-06-15",
          fechaFin: "2025-07-15",
          responsable: "Marta Ruiz",
          observaciones: "Inicio de obra",
        },
        {
          id: 5,
          parentId: 4,
          nombre: "Licitación de obra",
          fechaInicio: "2025-06-15",
          fechaFin: "2025-06-25",
          responsable: "Luis Torres",
          observaciones: "Proceso de licitación",
        },
        {
          id: 6,
          parentId: 4,
          nombre: "Firma de contrato",
          fechaInicio: "2025-06-26",
          fechaFin: "2025-06-28",
          responsable: "Laura Méndez",
          observaciones: "Firma legal",
        },
        {
          id: 7,
          parentId: 5,
          nombre: "Publicación de bases",
          fechaInicio: "2025-06-15",
          fechaFin: "2025-06-18",
          responsable: "Equipo Legal",
          observaciones: "",
        },
        {
          id: 8,
          parentId: 5,
          nombre: "Evaluación de propuestas",
          fechaInicio: "2025-06-19",
          fechaFin: "2025-06-24",
          responsable: "Comité Técnico",
          observaciones: "",
        },
      ];

      setActividades(data);
      setTreeData(buildTree(data));
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar actividades");
    }
  };

  const handleAddRoot = () => {
    // Aquí insertarías un nuevo root (puede ser un modal, inline, etc.)
    toast.info("Agregar nueva actividad raíz");
  };

  const handleAddChild = (parentId) => {
    // Aquí insertarías el hijo (modal, inline, etc.)
    toast.info(`Agregar subactividad para padre ${parentId}`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Programación WBS</h2>

      <button
        className="mb-4 bg-blue-600 text-white py-2 px-4 rounded"
        onClick={handleAddRoot}
      >
        + Agregar actividad principal
      </button>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Actividad</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Responsable</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {treeData.map((actividad) => (
            <ActividadRow
              key={actividad.id}
              actividad={actividad}
              onAddChild={handleAddChild}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Programacion;
