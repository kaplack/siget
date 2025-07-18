const Activity = require("../models/activityModel");
const { ActivityVersion } = require("../models");

const Project = require("../models/projectModel");
const {
  updateParentProgress,
  updateProjectProgress,
} = require("../utils/avanceUtils");

// POST /api/activities/:activityId/tracking
// Adds a new tracking version if a baseline exists
// POST /api/activities/:activityId/tracking
const addTrackingVersion = async (req, res) => {
  try {
    const { activityId } = req.params;
    const {
      fechaInicio,
      fechaFin,
      plazo,
      avance = 0,
      sustento = "",
      comentario = "",
    } = req.body;

    // Validate that baseline exists
    const baseline = await ActivityVersion.findOne({
      where: { activityId, tipoVersion: "base", nroVersion: 1, vigente: true },
    });

    if (!baseline) {
      return res.status(400).json({ message: "Baseline version not found." });
    }

    // Get activity and project
    const activity = await Activity.findByPk(activityId);
    const project = await Project.findByPk(activity.projectId);

    // Validate project has required dates
    if (!project.firmaConvenio) {
      return res.status(400).json({
        message:
          "El proyecto debe tener registradas la fecha de firma de convenio antes de continuar.",
      });
    }

    await ActivityVersion.update(
      { vigente: false },
      { where: { activityId, tipoVersion: "seguimiento" } }
    );

    // Continue with seguimiento creation
    const count = await ActivityVersion.count({
      where: { activityId, tipoVersion: "seguimiento" },
    });

    const nroVersion = count + 1;

    const lastVersion = await ActivityVersion.findOne({
      where: { activityId, tipoVersion: "seguimiento" },
      order: [["nroVersion", "DESC"]],
    });

    const newTracking = await ActivityVersion.create({
      activityId,
      tipoVersion: "seguimiento",
      nombre: lastVersion?.nombre ?? baseline.nombre,
      parentId: lastVersion?.parentId ?? baseline.parentId,
      orden: lastVersion?.orden ?? baseline.orden,
      predecesorId: lastVersion?.predecesorId ?? baseline.predecesorId,
      responsable: lastVersion?.responsable ?? baseline.responsable,
      comentario: req.body.hasOwnProperty("comentario")
        ? comentario
        : lastVersion?.comentario ?? baseline.comentario,
      sustento: req.body.hasOwnProperty("sustento")
        ? sustento
        : lastVersion?.sustento ?? "",
      fechaInicio: req.body.hasOwnProperty("fechaInicio")
        ? fechaInicio
        : lastVersion?.fechaInicio ?? baseline.fechaInicio,
      fechaFin: req.body.hasOwnProperty("fechaFin")
        ? fechaFin
        : lastVersion?.fechaFin ?? baseline.fechaFin,
      plazo: req.body.hasOwnProperty("plazo")
        ? plazo
        : lastVersion?.plazo ?? baseline.plazo,
      avance: req.body.hasOwnProperty("avance")
        ? avance
        : lastVersion?.avance ?? 0,
      nroVersion,
      vigente: true,
    });

    // Update project to 'ejecucion' if conditions are met
    if (nroVersion >= 2 && avance > 0 && project) {
      if (project.estado === "linea_base") {
        await project.update({ estado: "ejecucion" });
      }
    }

    res.status(201).json({ version: newTracking });
  } catch (error) {
    console.error("❌ Error adding tracking version:", error);
    res.status(500).json({ message: "Error adding tracking version." });
  }
};

module.exports = {
  addTrackingVersion,
};
