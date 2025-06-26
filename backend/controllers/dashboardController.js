const { Project, Activity, ActivityVersion } = require("../models");
const { Sequelize } = require("sequelize");
const { Op } = require("sequelize");

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

    const totalActividadesEjecutablesData = await ActivityVersion.findAll({
      where: {
        tipo: "seguimiento",
        vigente: true,
        activityId: {
          [Op.notIn]: Sequelize.literal(`(
        SELECT DISTINCT "parentId"
        FROM activity_versions
        WHERE "parentId" IS NOT NULL
          AND "parentId" > 0
      )`),
        },
      },
      attributes: ["activityId"],
      group: ["activityId"],
    });

    const totalActividadesEjecutables = totalActividadesEjecutablesData.length;

    // Total number of activities
    const totalActivities = await Activity.count();

    // global progress of all activities
    // Get all real (leaf) activity versions of type 'seguimiento' and vigente = true
    const hojas = await ActivityVersion.findAll({
      where: {
        tipo: "seguimiento",
        vigente: true,
        id: {
          [Sequelize.Op.notIn]: Sequelize.literal(`(
        SELECT DISTINCT "parentId"
        FROM activity_versions
        WHERE "parentId" IS NOT NULL
      )`),
        },
        plazo: {
          [Sequelize.Op.gt]: 0, // only consider plazo > 0
        },
      },
      attributes: ["plazo", "avance"],
    });

    // Sum weighted progress
    let totalPeso = 0;
    let totalAvancePonderado = 0;

    for (const actividad of hojas) {
      const plazo = actividad.plazo;
      const avance = actividad.avance || 0;

      totalPeso += plazo;
      totalAvancePonderado += avance * plazo;
    }

    let avanceGlobal = null;
    let mensajeAvanceGlobal = null;

    if (totalPeso > 0) {
      avanceGlobal = +(totalAvancePonderado / totalPeso).toFixed(2);
    } else {
      mensajeAvanceGlobal = "Plazos no definidos";
    }

    res.json({
      totalProjects,
      totalFirmados,
      totalBeneficiarios,
      totalInversion,

      proyectosPorEstado,
      totalActivities,
      totalActividadesEjecutables,

      avanceGlobal,
      mensajeAvanceGlobal,
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ error: "Error loading dashboard data" });
  }
};

module.exports = { getDashboard };
