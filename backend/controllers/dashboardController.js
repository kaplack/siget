const { Project, Activity, ActivityVersion } = require("../models");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

const getHojasEjecutables = async () => {
  return await ActivityVersion.findAll({
    where: {
      tipo: "seguimiento",
      vigente: true,
      activityId: {
        [Op.notIn]: Sequelize.literal(`(
          SELECT DISTINCT "parentId"
          FROM activity_versions
          WHERE "parentId" IS NOT NULL AND "parentId" > 0
        )`),
      },
      plazo: {
        [Op.gt]: 0,
      },
    },
    attributes: ["plazo", "avance", "activityId"],
    include: [
      {
        model: Activity,
        as: "activity",
        attributes: ["projectId"],
        include: [
          {
            model: Project,
            as: "project",
            attributes: ["nombreConvenio"],
          },
        ],
      },
    ],
  });
};

const calcularAvanceGlobal = (proyectos) => {
  let totalPeso = 0;
  let avancePonderado = 0;

  for (const p of proyectos) {
    if (p.avance !== null && p.totalPeso > 0) {
      totalPeso += p.totalPeso;
      avancePonderado += p.avance * p.totalPeso;
    }
  }

  if (totalPeso === 0) {
    return {
      avanceGlobal: null,
      mensajeAvanceGlobal: "Plazos no definidos",
    };
  }

  return {
    avanceGlobal: +(avancePonderado / totalPeso).toFixed(2),
    mensajeAvanceGlobal: null,
  };
};

const getAvancePorProyecto = (hojas) => {
  const avancePorProyecto = {};
  // Debugging line to check the structure of hojas

  for (const hoja of hojas) {
    const projectId = hoja.activity?.projectId;
    const nombreConvenio = hoja.activity?.project?.nombreConvenio;
    if (!projectId || !nombreConvenio) continue; // skip if projectId is missing

    const plazo = hoja.plazo;
    const avance = hoja.avance || 0;

    if (!avancePorProyecto[projectId]) {
      avancePorProyecto[projectId] = {
        nombreConvenio,
        totalPeso: 0,
        avancePonderado: 0,
      };
    }

    avancePorProyecto[projectId].totalPeso += plazo;
    avancePorProyecto[projectId].avancePonderado += avance * plazo;
  }

  return Object.entries(avancePorProyecto).map(([projectId, datos]) => ({
    projectId: Number(projectId),
    nombreConvenio: datos.nombreConvenio,
    totalPeso: datos.totalPeso,
    avance:
      datos.totalPeso > 0
        ? +(datos.avancePonderado / datos.totalPeso).toFixed(2)
        : null,
    mensaje: datos.totalPeso === 0 ? "Plazos no definidos" : null,
  }));
};

const getDashboard = async (req, res) => {
  try {
    // Total number of projects
    const totalProjects = await Project.count();

    // Total of signed projects (firmaConvenio is not null)
    const totalFirmados = await Project.count({
      where: {
        firmaConvenio: {
          [Sequelize.Op.not]: null,
        },
      },
    });

    // Total sum of beneficiaries
    const totalBeneficiarios = await Project.sum("numeroBeneficiarios");

    // Total investment amount
    const totalInversion = await Project.sum("montoInversion");

    // Projects grouped by status
    const proyectosPorEstado = await Project.findAll({
      attributes: [
        "estado",
        [Sequelize.fn("COUNT", Sequelize.col("estado")), "cantidad"],
      ],
      group: ["estado"],
    });

    const hojas = await getHojasEjecutables();

    const totalActividadesEjecutables = new Set(hojas.map((h) => h.activityId))
      .size;

    const avancePorProyecto = getAvancePorProyecto(hojas);
    const { avanceGlobal, mensajeAvanceGlobal } =
      calcularAvanceGlobal(avancePorProyecto);

    res.json({
      totalProjects,
      totalFirmados,
      totalBeneficiarios,
      totalInversion,

      proyectosPorEstado,
      totalActividadesEjecutables,

      avanceGlobal,
      mensajeAvanceGlobal,
      avancePorProyecto,
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ error: "Error loading dashboard data" });
  }
};

module.exports = { getDashboard };
